from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import razorpay
import logging

from app.core.config import settings
from app.database.session import get_db
from app.routes.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger("xynova_ai")

# Initialize Razorpay Client
try:
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception as e:
    logger.error(f"Failed to initialize Razorpay client: {e}")
    razorpay_client = None

class OrderCreate(BaseModel):
    amount: int  # in paise
    currency: str = "INR"

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create-order")
async def create_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user)
):
    if not razorpay_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment gateway is currently offline."
        )
        
    if payload.amount < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum order amount is 100 paise (1 INR)."
        )

    try:
        order_data = {
            "amount": payload.amount,
            "currency": payload.currency,
            "receipt": f"receipt_{uuid.uuid4().hex[:10]}"
        }
        order = razorpay_client.order.create(data=order_data)
        return {
            "order_id": order.get("id"),
            "amount": order.get("amount"),
            "currency": order.get("currency")
        }
    except Exception as e:
        logger.error(f"Razorpay Order Creation Failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate payment order with gateway."
        )

@router.post("/verify-payment")
async def verify_payment(
    payload: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not razorpay_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment gateway is currently offline."
        )

    try:
        # Construct parameters dict to verify signature
        params_dict = {
            'razorpay_order_id': payload.razorpay_order_id,
            'razorpay_payment_id': payload.razorpay_payment_id,
            'razorpay_signature': payload.razorpay_signature
        }
        
        # Verify the signature
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # If no exception, signature verification succeeded. Upgrade user!
        current_user.is_premium = True
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
        
        return {
            "status": "success",
            "message": "Payment verified. You are now a Premium member! 🚀",
            "is_premium": True
        }
    except Exception as e:
        logger.warning(f"Payment verification failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment signature verification failed. Unauthorized transaction."
        )

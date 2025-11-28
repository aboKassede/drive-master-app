from typing import Dict, Any

class PaymentService:
    @staticmethod
    async def process_payment(payment_data: Dict[str, Any]) -> Dict[str, Any]:
        # Mock payment processing
        return {
            "payment_id": f"pay_{payment_data.get('lesson_id', '123456789')}",
            "status": "completed",
            "amount": payment_data.get("amount", 0),
            "transaction_id": "txn_mock_123456"
        }
    
    @staticmethod
    async def get_payment_history(user_id: str) -> Dict[str, Any]:
        # Mock payment history
        return {
            "payments": [
                {
                    "id": "pay_123456789",
                    "amount": 50.0,
                    "date": "2024-01-15",
                    "status": "completed",
                    "lesson_id": "lesson_123"
                }
            ],
            "total_paid": 50.0
        }
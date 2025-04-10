import React from 'react'

// type FoodItem = {
//     mon_id: number;
//     pl_id: number;
//     mon_tenmon: string;
//     mon_giamon: number;
//     mon_mota: string;
//     mon_hinhmon: string;
//     mon_trangthai: string;
  
//   };
  
//   type OrderItem = {
//     stt: number;
//     mon_id: number;
//     mon_tenmon: string;
//     mon_giamon: number;
//     quantity: number;
//   };
//   type SubmitPayload = {
//     b_id: number;
//     items: {
//       food_id: number;
//       quantity: number;
//     }[];
//   };
  

export const SubmitOrderPage = () => {
    const payload = {
        b_id: b_id, // giả sử b_id là số, ví dụ: 5
        items: orderList.map((item) => ({
          food_id: item.mon_id,       // từ OrderItem.mon_id
          quantity: item.quantity     // từ OrderItem.quantity
        }))
      };
    
      try {
        const response = await fetch("http://localhost/api/submit-order.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
    
        if (response.ok) {
          const result = await response.json();
          alert("Gửi món thành công!");
          // Có thể reset orderList nếu cần
        } else {
          alert("Gửi món thất bại!");
        }
      } catch (error) {
        console.error("Lỗi khi gửi món:", error);
        alert("Có lỗi xảy ra khi gửi món!");
      }
}

  

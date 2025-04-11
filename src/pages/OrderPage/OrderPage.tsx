import { useEffect, useState } from "react";
import { HeaderPage } from "../../components/HeaderPage/HeaderPage";
import "./OrderPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  showSuccessToast,
  showErrorToast,
} from "../../components/ToastService/ToastService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
// Kiểu dữ liệu cho danh mục và món ăn
type Category = {
  pl_id: number;
  pl_tenphanloai: string;
  pl_tenhinh: string;
};

type FoodItem = {
  mon_id: number;
  pl_id: number;
  mon_tenmon: string;
  mon_giamon: number;
  mon_mota: string;
  mon_hinhmon: string;
  mon_trangthai: string;
};

type OrderItem = {
  stt: number;
  mon_id: number;
  mon_tenmon: string;
  mon_giamon: number;
  quantity: number;
};
export const OrderPage = () => {
  const location = useLocation();
  const { b_id, tableName } = location.state || {};
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryList, setCategorieList] = useState<Category[]>([]);
  const [FoodItem, setFoodItem] = useState<FoodItem[]>([]);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [foodLoaded, setFoodLoaded] = useState(false);
  const navigate = useNavigate();
  const [newOrderList, setNewOrderList] = useState<OrderItem[]>([]);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("0"); // default
  const [hasOrderData, setHasOrderData] = useState(false);
  // const [newOrderNotSend, newOrderNotSend] = useState<OrderItem[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://quanlyquananapi-production.up.railway.app/api/phanloaivamonan"
        );
        const data = await response.json();

        if (data.result === 1) {
          // Lấy danh sách danh mục từ API
          const categoryList: Category[] = data.phanloai.map((cat: any) => ({
            pl_id: cat.pl_id,
            pl_tenphanloai: cat.pl_tenpl,
            pl_tenhinh: cat.pl_tenhinh,
          }));

          // Lấy danh sách món ăn từ API
          const foodList: FoodItem[] = data.phanloai.flatMap((cat: any) =>
            cat.monan.map((mon: any) => ({
              mon_id: mon.mon_id,
              pl_id: cat.pl_id, // Gán id danh mục vào món ăn
              mon_tenmon: mon.mon_tenmon,
              // mom_giamon: mon.mon_giamon,
              mon_giamon: mon.mon_giamon,
              mon_mota: mon.mon_mota,
              mon_hinhmon: mon.mon_hinhmon,
              mon_trangthai: mon.mon_trangthai,
            }))
          );

          // ... xử lý foodList
          setCategorieList(categoryList);
          setFoodItem(foodList);
          setFoodLoaded(true); // ✅ Chỉ gọi sau khi FoodItem sẵn sàng
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (foodLoaded) {
      fetchMonOrder(); // ✅ Bây giờ mới được gọi
    }
  }, [foodLoaded]);

  const handleAddToOrder = (item: FoodItem) => {
    const existingItem = orderList.find(
      (order) => order.mon_id === item.mon_id
    );

    if (existingItem) {
      existingItem.quantity += 1;
      setOrderList([...orderList]);
    } else {
      const newOrderItem: OrderItem = {
        stt: orderList.length + 1,
        mon_id: item.mon_id,
        mon_tenmon: item.mon_tenmon,
        mon_giamon: item.mon_giamon,
        quantity: 1,
      };
      setOrderList([...orderList, newOrderItem]);
    }

    // Cập nhật danh sách món mới (chỉ thêm mới)
    const newItem = newOrderList.find((order) => order.mon_id === item.mon_id);

    if (newItem) {
      newItem.quantity += 1;
      setNewOrderList([...newOrderList]);
    } else {
      const newOrderItem: OrderItem = {
        stt: newOrderList.length + 1, // thứ tự trong danh sách món mới
        mon_id: item.mon_id,
        mon_tenmon: item.mon_tenmon,
        mon_giamon: item.mon_giamon,
        quantity: 1,
      };
      setNewOrderList([...newOrderList, newOrderItem]);
    }
  };

  //tăng giảm món
  const handleIncreaseQuantity = (mon_id: number) => {
    const updatedOrderList = orderList.map((item) =>
      item.mon_id === mon_id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setOrderList(updatedOrderList);

    // Cập nhật newOrderList
    const existingItem = newOrderList.find((item) => item.mon_id === mon_id);

    let updatedNewOrderList;
    if (existingItem) {
      updatedNewOrderList = newOrderList.map((item) =>
        item.mon_id === mon_id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      const food = FoodItem.find((item) => item.mon_id === mon_id);
      if (food) {
        updatedNewOrderList = [
          ...newOrderList,
          {
            stt: newOrderList.length + 1,
            mon_id: food.mon_id,
            mon_tenmon: food.mon_tenmon,
            mon_giamon: food.mon_giamon,
            quantity: 1,
          },
        ];
      } else {
        updatedNewOrderList = [...newOrderList];
      }
    }

    setNewOrderList(updatedNewOrderList);
  };

  const handleDecreaseQuantity = (mon_id: number) => {
    const updatedOrderList = orderList.map((item) =>
      item.mon_id === mon_id
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item
    );
    // .filter((item) => item.quantity > 0);
    setOrderList(updatedOrderList);

    // Cập nhật newOrderList
    const updatedNewOrderList = newOrderList
      .map((item) =>
        item.mon_id === mon_id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0); // ✅ Xoá nếu quantity về 0
    setNewOrderList(updatedNewOrderList);
  };

  const handleRemoveFromOrder = (mon_id: number) => {
    setOrderList(orderList.filter((item) => item.mon_id !== mon_id));
    setNewOrderList(newOrderList.filter((item) => item.mon_id !== mon_id)); // 👈 thêm dòng này
  };

  const totalAmount = orderList.reduce(
    (total, item) => total + item.mon_giamon * item.quantity,
    0
  );

  //Nút bấm order
  const handleSubmitOrder = async () => {
    if (newOrderList.length === 0) {
      alert("Bạn chưa thêm món mới nào!");
      return;
    }

    const payload = {
      u_id: user.u_id,
      b_id: b_id,
      items: newOrderList.map((item) => ({
        food_id: item.mon_id,
        quantity: item.quantity,
      })),
    };
    console.log(payload);
    try {
      const response = await fetch(
        "https://quanlyquananapi-production.up.railway.app/api/create-update-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (response.ok) {
        fetchMonOrder();
        showSuccessToast(result.message);
        // setIsOrderSubmitted(true);
      } else {
        showErrorToast(result.message);
      }
    } catch (error) {
      console.error("Lỗi khi gửi món:", error);
      alert("Có lỗi xảy ra khi gửi món!");
    }
  };

  const fetchMonOrder = async () => {
    try {
      const response = await fetch(
        `https://quanlyquananapi-production.up.railway.app/api/hoadonban/${b_id}`
      );
      const data = await response.json();

      if (data?.hoadon?.ds_chi_tiet_hoa_don?.length > 0) {
        setHasOrderData(true);
        const fetchedOrderList: OrderItem[] =
          data.hoadon.ds_chi_tiet_hoa_don.map((ct: any, index: number) => {
            const food = FoodItem.find((item) => item.mon_id === ct.mon_id);
            return {
              stt: index + 1,
              mon_id: ct.mon_id,
              mon_tenmon: food?.mon_tenmon,
              mon_giamon: food?.mon_giamon, // fallback
              quantity: ct.ct_soluong,
            };
          });

        setOrderList(fetchedOrderList);
      } else {
        setOrderList([]);
        setHasOrderData(false);
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  };

  // Lọc món ăn theo danh mục được chọn
  const filteredItems = selectedCategory
    ? FoodItem.filter((item) => item.pl_id === selectedCategory)
    : FoodItem;

  return (
    <>
      <HeaderPage />
      <div className="container mx-auto mt-5">
        <div className="orderZone">
          <h2>
            Phiếu Order {tableName} - mã bàn: {b_id}
          </h2>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên món</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((item, index) => (
                <tr key={item.mon_id}>
                  <td>{index + 1}</td>
                  <td>{item.mon_tenmon}</td>
                  <td>
                    <div className="quantity-control">
                      <button
                        onClick={() => handleDecreaseQuantity(item.mon_id)}
                      >
                        -
                      </button>
                      <span className="quantity-number">{item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.mon_id)}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td>
                    {(item.mon_giamon * item.quantity).toLocaleString()} đ
                  </td>
                  <td>
                    {newOrderList.some(
                      (newItem) => newItem.mon_id === item.mon_id
                    ) && (
                      <button
                        onClick={() => handleRemoveFromOrder(item.mon_id)}
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="totalAmountContainer">
            <div className="totalAmountText">
              Tổng cộng:{" "}
              <span className="totalAmountValue">
                {totalAmount.toLocaleString()} đ
              </span>
            </div>
            <div className="totalAmountButtons">
              <button
                className="submitButton orderButton"
                onClick={handleSubmitOrder}
              >
                Gửi món
              </button>
              {hasOrderData && (
                <button
                  className="submitButton paymentButton"
                  onClick={() => setOpenPaymentDialog(true)}
                >
                  Thanh toán
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Phân loại món ăn */}
        <div className="categoryList">
          <div
            key={0}
            className={`categoryItem ${selectedCategory === 0 ? "active" : ""}`}
            onClick={() => setSelectedCategory(0)}
          >
            {/* <img src={cat.pl_tenhinh} alt={cat.pl_tenhinh} className="categoryImage" /> */}
            <p className="categoryName">Tất cả món ăn</p>
          </div>
          {categoryList.map((cat) => (
            <div
              key={cat.pl_id}
              className={`categoryItem ${
                selectedCategory === cat.pl_id ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.pl_id)}
            >
              <img
                src={cat.pl_tenhinh}
                alt={cat.pl_tenhinh}
                className="categoryImage"
              />
              <p className="categoryName">{cat.pl_tenphanloai}</p>
            </div>
          ))}
        </div>

        {/* Danh sách món ăn */}
        <div className="foodList">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.mon_id}
                className="foodItem"
                onClick={() => handleAddToOrder(item)}
              >
                <img
                  src={item.mon_hinhmon}
                  alt={item.mon_tenmon}
                  className="foodImage"
                />
                <p className="foodName">{item.mon_tenmon}</p>
              </div>
            ))
          ) : (
            <p>Không có món ăn nào trong danh mục này.</p>
          )}
        </div>
      </div>
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        PaperProps={{
          style: {
            borderRadius: "20px",
            padding: "20px",
            background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <DialogTitle
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "22px",
            color: "#a0522d",
          }}
        >
          Xác nhận thanh toán
        </DialogTitle>

        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="payment-method-label" style={{ color: "#6a4e42" }}>
              Phương thức thanh toán
            </InputLabel>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              label="Phương thức thanh toán"
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                backgroundColor: "#fff7f0",
                borderRadius: "8px",
                fontWeight: "bold",
                color: "#5c4033",
              }}
            >
              <MenuItem value="0">💵 Tiền mặt</MenuItem>
              <MenuItem value="1">💳 Thẻ</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions style={{ justifyContent: "center" }}>
          <Button
            onClick={() => setOpenPaymentDialog(false)}
            style={{
              backgroundColor: "#d9534f",
              color: "white",
              borderRadius: "10px",
              padding: "8px 20px",
              fontWeight: "bold",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={async () => {
              try {
                const response = await fetch(
                  `https://quanlyquananapi-production.up.railway.app/api/thanhtoanhoadon/${b_id}`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      pttt: paymentMethod,
                      _method: "PUT",
                    }),
                  }
                );

                const result = await response.json();

                if (response.ok) {
                  showSuccessToast("Thanh toán thành công!");
                  // Có thể reset lại orderList nếu muốn
                  navigate("/Home");
                } else {
                  showErrorToast(result.message || "Thanh toán thất bại!");
                }
              } catch (error) {
                console.error("Lỗi khi thanh toán:", error);
                showErrorToast("Có lỗi xảy ra khi thanh toán!");
              }
            }}
            style={{
              backgroundColor: "#5cb85c",
              color: "white",
              borderRadius: "10px",
              padding: "8px 20px",
              fontWeight: "bold",
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

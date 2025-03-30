import { useEffect, useState } from 'react';
import { HeaderPage } from '../../components/HeaderPage/HeaderPage';
import './OrderPage.css';
import { useLocation } from 'react-router-dom';
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
  const { tableId, tableName } = location.state || {};
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryList, setCategorieList] = useState<Category[]>([]);
  const [FoodItem, setFoodItem] = useState<FoodItem[]>([]);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
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

          setCategorieList(categoryList);
          setFoodItem(foodList);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchData();
  }, []);


  const handleAddToOrder = (item: FoodItem) => {
    const existingItem = orderList.find(order => order.mon_id === item.mon_id);

    if (existingItem) {
      existingItem.quantity += 1;
      setOrderList([...orderList]);
    } else {
      const newOrderItem: OrderItem = {
        stt: orderList.length + 1,
        mon_id: item.mon_id,
        mon_tenmon: item.mon_tenmon,
        mon_giamon: item.mon_giamon,
        quantity: 1
      };
      setOrderList([...orderList, newOrderItem]);
    }
  };

  const handleRemoveFromOrder = (mon_id: number) => {
    setOrderList(orderList.filter(item => item.mon_id !== mon_id));
  };

  const totalAmount = orderList.reduce((total, item) => total + item.mon_giamon * item.quantity, 0);


  // Lọc món ăn theo danh mục được chọn
  const filteredItems = selectedCategory
    ? FoodItem.filter((item) => item.pl_id === selectedCategory)
    : FoodItem;



  return (
    <>
      <HeaderPage />
      <div className='container mx-auto mt-5'>
        Order Zone
        <div className="orderZone">
          <h2>Phiếu Order {tableName}</h2>
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
                  <td>{item.quantity}</td>
                  <td>{(item.mon_giamon * item.quantity).toLocaleString()} đ</td>
                  <td>
                    <button onClick={() => handleRemoveFromOrder(item.mon_id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="totalAmount">
            Tổng cộng: {totalAmount.toLocaleString()} đ
          </div>
        </div>

        {/* Phân loại món ăn */}
        <div className="categoryList" >
          <div
            key={0}
            className={`categoryItem ${selectedCategory === 0 ? "active" : ""}`}
            onClick={() => setSelectedCategory(0)}>
            {/* <img src={cat.pl_tenhinh} alt={cat.pl_tenhinh} className="categoryImage" /> */}
            <p className="categoryName">Tất cả món ăn</p>
          </div>
          {categoryList.map((cat) => (
            <div
              key={cat.pl_id}
              className={`categoryItem ${selectedCategory === cat.pl_id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.pl_id)}>
              <img src={cat.pl_tenhinh} alt={cat.pl_tenhinh} className="categoryImage" />
              <p className="categoryName">{cat.pl_tenphanloai}</p>
            </div>
          ))}
        </div>

        {/* Danh sách món ăn */}
        <div className="foodList">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.mon_id} className="foodItem" onClick={() => handleAddToOrder(item)}>
                <img src={item.mon_hinhmon} alt={item.mon_tenmon} className="foodImage" />
                <p className="foodName">{item.mon_tenmon}</p>
              </div>
            ))
          ) : (
            <p>Không có món ăn nào trong danh mục này.</p>
          )}
        </div>


      </div>
    </>
  );
};


import React, { useState, useEffect } from "react";
import { HeaderPage } from "../components/HeaderPage/HeaderPage";

interface Shift {
  id: number;
  date: string;
  totalRevenue: number;
  invoices: Invoice[];
}

interface Invoice {
  id: number;
  time: string;
  amount: number;
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const userId = 1;

  const fetchShifts = async () => {
    try {
      const response = await fetch(
        "https://quanlyquananapi-production.up.railway.app/api/danhsachketca"
      );
      const data = await response.json();

      if (data.result === 1 && data.danhsachketca.length > 0) {
        const formattedShifts: Shift[] = data.danhsachketca.map(
          (item: any) => ({
            id: item.kc_id,
            date: new Date(item.kc_ngaygio).toLocaleDateString("vi-VN"),
            totalRevenue: item.kc_tongtien,
            invoices: [],
          })
        );
        setShifts(formattedShifts);
      } else {
        setShifts([]);
      }
    } catch (error) {
      alert("Lỗi khi tải dữ liệu từ API!");
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const previewShift = async () => {
    try {
      const response = await fetch(
        "https://quanlyquananapi-production.up.railway.app/api/previewketca"
      );
      const data = await response.json();
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      alert("Lỗi khi xem trước kết ca!");
    }
  };

  const createShift = async () => {
    setIsCreating(true);
    setShowPreview(false);
    try {
      const response = await fetch(
        `https://quanlyquananapi-production.up.railway.app/api/taoketca/${userId}`,
        { method: "POST" }
      );
      const data = await response.json();

      if (data.kc_id) {
        alert("✅ Tạo kết ca thành công!");
        fetchShifts();
      } else {
        alert(`❌ Lỗi: ${data.error}`);
      }
    } catch (error) {
      alert("🚨 Có lỗi xảy ra khi tạo kết ca!");
    }
    setIsCreating(false);
  };

  const handleViewShiftDetails = async (shift: Shift) => {
    try {
      const response = await fetch(
        `https://quanlyquananapi-production.up.railway.app/api/danhsachhoadon/${userId}`
      );
      const data = await response.json();
      if (data.result === 1) {
        const realInvoices: Invoice[] = data.danhsachhoadon.map(
          (invoice: any) => ({
            id: invoice.hd_id,
            time: new Date(invoice.hd_ngaygio).toLocaleTimeString("vi-VN"),
            amount: invoice.hd_tongtien,
          })
        );

        setSelectedShift({
          ...shift,
          invoices: realInvoices,
        });
      } else {
        alert("Không thể tải danh sách hóa đơn.");
      }
    } catch (error) {
      alert("Lỗi khi tải hóa đơn.");
    }
  };

  return (
    <>
      <HeaderPage />
      <div className="flex flex-col items-center p-6">
        <h1 className="text-2xl font-bold mb-4">Quản Lý Kết Ca</h1>

        <button
          className="mb-4 px-4 py-2 text-white rounded"
          style={{ backgroundColor: "#8B4513" }}
          onClick={previewShift}
        >
          Xem Trước Kết Ca
        </button>

        <div className="w-full max-w-4xl !bg-white shadow-md p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Danh sách kết ca</h2>
          {shifts.length === 0 ? (
            <p className="text-gray-600">Danh sách trống</p>
          ) : (
            shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex justify-between items-center p-3 border-b"
              >
                <div>
                  <p className="font-semibold">
                    Ca {shift.id} - {shift.date}
                  </p>
                  <p className="text-gray-600">
                    Doanh thu: {shift.totalRevenue.toLocaleString()} VND
                  </p>
                </div>
                <button
                  className="px-4 py-2  text-white rounded"
                  style={{ backgroundColor: "#8B4513" }}
                  onClick={() => handleViewShiftDetails(shift)}
                >
                  Xem chi tiết
                </button>
              </div>
            ))
          )}
        </div>

        {showPreview && previewData && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 z-50">
              <h2 className="text-xl font-semibold mb-3">Xem Trước Kết Ca</h2>
              <p>
                Giờ bắt đầu:{" "}
                {new Date(previewData.giobatdauban).toLocaleTimeString()}
              </p>
              <p>
                Giờ hiện tại:{" "}
                {new Date(previewData.giohientai).toLocaleTimeString()}
              </p>
              <p>Tổng tiền: {previewData.tongtien.toLocaleString()} VND</p>
              <p>Số lượng hóa đơn: {previewData.soluonghoadon}</p>
              <div className="flex gap-4 mt-4">
                <button
                  className="px-4 py-2 !bg-red-500 text-white rounded hover:!bg-red-600"
                  onClick={() => setShowPreview(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 !bg-green-500 text-white rounded hover:!bg-green-600"
                  onClick={createShift}
                  disabled={isCreating}
                >
                  {isCreating ? "Đang tạo..." : "Xác nhận tạo kết ca"}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedShift && (
          <div className="w-full max-w-4xl bg-white shadow-md p-4 rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-3">
              Hóa đơn trong ca {selectedShift.id} - {selectedShift.date}
            </h2>
            {selectedShift.invoices.length > 0 ? (
              selectedShift.invoices.map((invoice) => (
                <div key={invoice.id} className="p-3 border-b">
                  <p className="font-semibold">Hóa đơn {invoice.id}</p>
                  <p className="text-gray-600">Thời gian: {invoice.time}</p>
                  <p className="text-gray-600">
                    Tổng tiền: {invoice.amount.toLocaleString()} VND
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Không có hóa đơn nào</p>
            )}
            <button
              className="mt-4 px-4 py-2 !bg-red-500 text-white rounded hover:!bg-red-600"
              onClick={() => setSelectedShift(null)}
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ShiftManagement;

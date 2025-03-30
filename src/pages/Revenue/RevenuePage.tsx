import { useState } from "react";
import { Card, CardContent, Button } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { HeaderPage } from '../../components/HeaderPage/HeaderPage';

type RevenueData = {
    total_tongtien: number;
    total_hoadon: number;
};

const RevenuePage = () => {
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!startDate || !endDate) {
            setError("Bạn cần chọn ngày xuất doanh thu");
            return;
        }

        setLoading(true);
        setError(null);
        setRevenueData(null);

        const apiUrl = `https://quanlyquananapi-production.up.railway.app/api/doanhthu?start_date=${dayjs(startDate).format("YYYY-MM-DD")}&end_date=${dayjs(endDate).format("YYYY-MM-DD")}`;

        try {
            const response = await fetch(apiUrl);
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error("Lỗi khi lấy dữ liệu từ server");
            }
            const data = await response.json();
            console.log("Response data:", data);
            setRevenueData(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <HeaderPage />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="p-4 space-y-4 mt-8 flex flex-col items-center">
                    <div className="flex gap-4 items-center">
                        <DatePicker label="Từ ngày" value={startDate} onChange={(newValue) => setStartDate(newValue ? dayjs(newValue) : null)} />
                        <DatePicker label="Đến ngày" value={endDate} onChange={(newValue) => setEndDate(newValue ? dayjs(newValue) : null)} />
                        <Button variant="contained" color="primary" onClick={handleSearch} disabled={loading}>
                            {loading ? "Đang tải..." : "Tìm kiếm"}
                        </Button>
                    </div>

                    {/* Hiển thị doanh thu */}
                    {error && <p className="text-red-500">{error}</p>}
                    {revenueData && (
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent>
                                    <h2 className="text-xl font-bold">Tổng doanh thu</h2>
                                    <p className="text-lg">{revenueData.total_tongtien.toLocaleString()} VND</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <h2 className="text-xl font-bold">Tổng số hóa đơn</h2>
                                    <p className="text-lg">{revenueData.total_tongtien} cái cc</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </LocalizationProvider>
        </>
    );
};

export default RevenuePage;
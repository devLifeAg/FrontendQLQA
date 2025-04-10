import React, { useEffect, useState } from "react";
import { HeaderPage } from '../components/HeaderPage/HeaderPage';
import { useNavigate } from 'react-router-dom';
import {
  // Container,
  // TextField,
  // Button,
  // List,
  // ListItem,
  // ListItemText,
  // ListItemButton,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
  // Box,
  Typography,
} from "@mui/material";
import { showErrorToast } from '../components/ToastService/ToastService';
import './Home.css';
interface Tang {
  t_id: number;
  t_tentang: string;
  t_trangthai: number;
  danhsachban: Ban[];
}

interface Ban {
  b_id: number;
  b_tenban: string;
  b_trangthai: number;
  t_id: number;
  trong: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate(); // Sử dụng useNavigate() để tạo hàm navigate
  const [floors, setFloors] = useState<Tang[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const handleFloorClick = (t_id: number) => {
    setSelectedFloor(t_id);
  };

  const handleBanClick = (b_id: number, tableName: string) => {
    navigate(`/Order/${b_id}`, { state: { b_id, tableName } });
  }

  const selectedFloorData = floors.find(floor => floor.t_id === selectedFloor);
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const response = await fetch(
          "https://quanlyquananapi-production.up.railway.app/api/tangvaban"
        );
        const data = await response.json();
        if (data.result === 1) {
          setFloors(data.tang);
        } else {
          showErrorToast('Có lỗi khi lấy dữ liệu.');
        }
      } catch (error) {
        showErrorToast((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchFloors();
  }, []);

  if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;

  return (
    <>
      <HeaderPage />
      <div className="flex flex-col items-center p-6">


        {/* Danh sách tầng */}
        <Typography className="!mt-6" sx={{ color: '#8B4513', fontWeight: 'bold', fontFamily: 'Noto Serif, serif' }} variant="h3" gutterBottom>
          Danh Sách Tầng
        </Typography>
        <div className="flex space-x-4 mb-6">
          {floors.map(floor => (
            <button
              key={floor.t_id}
              onClick={() => handleFloorClick(floor.t_id)}
              className={`btn-custom px-4 py-2 rounded-lg btn-custom ${selectedFloor === floor.t_id ? 'selected' : ''} ${floor.t_trangthai === 0 ? 'opacity-80 cursor-not-allowed' : ''}`}
              disabled={floor.t_trangthai === 0}
            >
              {floor.t_tentang}
            </button>
          ))}
        </div>

        {/* Danh sách bàn */}
        {selectedFloorData && (
          <>
            <Typography className="!mt-6" sx={{ color: '#ad5c22', fontWeight: 'bold', fontFamily: 'Noto Serif, serif' }} variant="h4" gutterBottom>
              Danh Sách Bàn {floors.find((f) => f.t_id === selectedFloor)?.t_tentang}
            </Typography>
            <div className="grid grid-cols-3 gap-4">
              {selectedFloorData.danhsachban.map(ban => (
                <button
                  key={ban.b_id}
                  onClick={() => handleBanClick(ban.b_id, ban.b_tenban)}
                  className={`btn-ban px-4 py-2 rounded-lg btn-custom ${ban.b_trangthai === 0 ? 'opacity-80 cursor-not-allowed' : ''}
              ${ban.trong ? '' : '!bg-red-500 !text-white'}`}
                  disabled={ban.b_trangthai === 0}
                >
                  {ban.b_tenban}
                  <div className="text-sm mt-1">
                    {ban.trong ? 'Trống' : 'Có khách'}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;

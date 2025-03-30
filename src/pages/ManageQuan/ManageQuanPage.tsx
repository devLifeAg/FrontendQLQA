import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { HeaderPage } from "../../components/HeaderPage/HeaderPage";
import { showSuccessToast, showErrorToast } from '../../components/ToastService/ToastService';

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
}
const ManageQuanPage: React.FC = () => {
  const [floors, setFloors] = useState<Tang[]>([]);
  const [floorName, setFloorName] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [tableName, setTableName] = useState('');
  const [editTableName, setEditTableName] = useState('');
  const [editFloorName, setEditFloorName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFloor, setEditFloor] = useState<Tang | null>(null);
  const [editTable, setEditTable] = useState<Ban | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "floor" | "table"; id: number } | null>(null);

  const fetchTangVaBan = async () => {
    try {
      const response = await fetch('https://quanlyquananapi-production.up.railway.app/api/tangvaban');
      const data = await response.json();

      if (data.result === 1 && data.tang) {  // Kiểm tra nếu dữ liệu trả về hợp lệ
        setFloors(data.tang);
      } else {
        showErrorToast('Dữ liệu không hợp lệ.');
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  };

  useEffect(() => {
    fetchTangVaBan();
  }, []);

  // Thêm tầng
  const handleAddFloor = async () => {
    if (floorName.trim() === "" && floorName.length > 30) {
      showErrorToast("Tên tầng không được để trống hoặc vượt quá 30 ký tự.");
      return;
    }

    const formData = new FormData();
    formData.append('t_tentang', floorName);
    try {
      const response = await fetch('https://quanlyquananapi-production.up.railway.app/api/themtang', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        showErrorToast('Đã xảy ra lỗi khi thêm tầng.');
        return;
      }
      setFloorName('');
      showSuccessToast('Thêm tầng thành công!');
      await fetchTangVaBan();
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  };

  // Xác nhận xóa tầng
  const handleDeleteFloor = (id: number) => {
    setDeleteConfirm({ type: "floor", id });
  };

  // Xác nhận xóa bàn
  const handleDeleteTable = (id: number) => {
    setDeleteConfirm({ type: "table", id });
  };

  // Xử lý xóa sau khi xác nhận
  const confirmDelete = async () => {
    if (deleteConfirm?.type === "floor") {
      try {
        const response = await fetch(`https://quanlyquananapi-production.up.railway.app/api/xoatang/${deleteConfirm.id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (!response.ok) {
          showErrorToast(data.message);
          return;
        }

        showSuccessToast('Xóa tầng thành công!');
      } catch (error) {
        showErrorToast((error as Error).message);
      }
    } else if (deleteConfirm?.type === "table") {
      try {
        const response = await fetch(`https://quanlyquananapi-production.up.railway.app/api/xoaban/${deleteConfirm.id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
          showErrorToast(data.message);
          return;
        }

        showSuccessToast('Xóa bàn thành công!');
      } catch (error) {
        showErrorToast((error as Error).message);
      }
    }
    fetchTangVaBan();

    setDeleteConfirm(null);
  };

  // Chỉnh sửa tầng
  const handleEditFloor = (floor: Tang) => {
    setEditFloor(floor);
    setEditTable(null); // Đảm bảo editTable bị xóa khi chỉnh sửa tầng
    setEditFloorName(floor.t_tentang);
    setEditTableName(""); // Xóa giá trị tableName khi chỉnh sửa tầng
    setDialogOpen(true);
  };

  const handleSaveFloor = async () => {
    if (editFloorName.trim() === "" || editFloorName.length > 30) {
      showErrorToast("Tên tầng không được để trống hoặc vượt quá 30 ký tự.");
      return;
    }

    const formData = new FormData();
    formData.append('t_tentang', editFloorName);
    formData.append('_method', 'PUT');
    try {
      const response = await fetch(`https://quanlyquananapi-production.up.railway.app/api/suatang/${editFloor?.t_id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        showErrorToast('Đã xảy ra lỗi khi cập nhật tầng.');
        return;
      }
      setDialogOpen(false);
      setEditFloor(null);
      setEditFloorName("");
      showSuccessToast('Cập nhật tầng thành công!');
      await fetchTangVaBan();
    } catch (error) {
      showErrorToast((error as Error).message);
    }

  };

  // Bật/tắt tầng
  const handleToggleFloorStatus = async (id: number) => {
    try {
      const response = await fetch(`https://quanlyquananapi-production.up.railway.app/api/tatmotang/${id}`, {
        method: 'PUT',
      });

      const data = await response.json();
      if (!response.ok) {
        showErrorToast(data.message);
        return;
      }
      showSuccessToast(data.message);
      await fetchTangVaBan();
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  };

  // Chọn tầng để xem bàn
  const handleSelectFloor = (id: number) => {
    setSelectedFloor(id);
  };

  // Thêm bàn
  const handleAddTable = async () => {
    if (selectedFloor == null) {
      showErrorToast("Vui lòng chọn tầng để thêm bàn!");
      return;
    }
    if (tableName.trim() === "" || tableName.length > 30) {
      showErrorToast("Tên bàn không được để trống hoặc vượt quá 30 ký tự.");
      return;
    }

    const formData = new FormData();
    formData.append('b_tenban', tableName);
    formData.append('t_id', selectedFloor.toString());
    try {
      const response = await fetch('https://quanlyquananapi-production.up.railway.app/api/themban', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        showErrorToast('Đã xảy ra lỗi khi thêm bàn.');
        return;
      }
      setTableName('');
      showSuccessToast('Thêm bàn thành công!');
      await fetchTangVaBan();
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  };

  // Chỉnh sửa bàn
  const handleEditTable = (table: Ban) => {
    setEditTable(table);
    setEditFloor(null); // Đảm bảo editFloor bị xóa khi chỉnh sửa bàn
    setEditTableName(table.b_tenban);
    setEditFloorName(""); // Xóa giá trị floorName khi chỉnh sửa bàn
    setDialogOpen(true);
  };

  const handleSaveTable = async () => {
    if (editTableName.trim() === "" || editTableName.length > 30) {
      showErrorToast("Tên bàn không được để trống hoặc vượt quá 30 ký tự.");
      return;
    }

    const formData = new FormData();
    formData.append('b_tenban', editTableName);
    formData.append('t_id', editTable!.t_id.toString());
    formData.append('_method', 'PUT');
    try {
      const response = await fetch(`https://quanlyquananapi-production.up.railway.app/api/suaban/${editTable?.b_id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        showErrorToast('Đã xảy ra lỗi khi cập nhật bàn.');
        return;
      }
      setTableName('');
      showSuccessToast('Cập nhật bàn thành công!');
      await fetchTangVaBan();
    } catch (error) {
      showErrorToast((error as Error).message);
    }
    setDialogOpen(false);
    setEditTable(null);
    setEditTableName("");
  };

  // Bật/tắt bàn
  const handleToggleTableStatus = async (id: number) => {
    try {
      const response = await fetch(`https://quanlyquananapi-production.up.railway.app/api/tatmoban/${id}`, {
        method: 'PUT',
      });

      const data = await response.json();
      if (!response.ok) {
        showErrorToast(data.message);
        return;
      }
      showSuccessToast(data.message);
      await fetchTangVaBan();
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  };

  return (
    <>
      <HeaderPage />
      <Container className="mb-8">
        <Box className="mt-4" display="flex" gap={1} mb={2}>
          <TextField label="Tên tầng" value={floorName} onChange={(e) => setFloorName(e.target.value)} />
          <Button variant="contained" sx={{
            backgroundColor: '#8B4513', // Màu nền
            color: '#F0E68C',           // Màu chữ
            '&:hover': {
              backgroundColor: '#6B2F0B' // Màu nền khi hover
            }
          }} onClick={handleAddFloor} startIcon={<AddIcon />}>
            Thêm tầng
          </Button>
        </Box>

        <List sx={{ minHeight: 200, maxHeight: 200, overflowY: "auto", border: "1px solid #ddd", borderRadius: 1 }}>
          {floors.map((floor) => (
            <ListItem
              key={floor.t_id}
              sx={{
                background: selectedFloor === floor.t_id ? "#ddd" : "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ListItemButton onClick={() => handleSelectFloor(floor.t_id)} sx={{ flexGrow: 1 }}>
                <ListItemText primary={`${floor.t_tentang} - ${floor.t_trangthai == 1 ? 'Hoạt động' : 'Đã tắt'}`} />
              </ListItemButton>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={() => handleToggleFloorStatus(floor.t_id)}>
                  <VisibilityOffIcon />
                </Button>
                <Button onClick={() => handleEditFloor(floor)} color="primary">
                  <EditIcon />
                </Button>
                <Button onClick={() => handleDeleteFloor(floor.t_id)} color="error">
                  <DeleteIcon />
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>

        {selectedFloor !== null && (
          <>
            <Typography className="!mt-6" sx={{ color: '#8B4513', fontWeight: 'bold', fontFamily: 'Noto Serif, serif' }} variant="h5" gutterBottom>
              Danh Sách Bàn {floors.find((f) => f.t_id === selectedFloor)?.t_tentang}
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField label="Tên bàn" value={tableName} onChange={(e) => setTableName(e.target.value)} />
              <Button variant="contained" sx={{
                backgroundColor: '#8B4513', // Màu nền
                color: '#F0E68C',           // Màu chữ
                '&:hover': {
                  backgroundColor: '#6B2F0B' // Màu nền khi hover
                }
              }} onClick={handleAddTable} startIcon={<AddIcon />}
                disabled={selectedFloor === null}>
                Thêm bàn
              </Button>
            </Box>

            <List sx={{ minHeight: 200, maxHeight: 200, overflowY: "auto", border: "1px solid #ddd", borderRadius: 1 }}>
              {floors.find((f) => f.t_id === selectedFloor)?.danhsachban.map((table) => (
                <ListItem key={table.b_id} sx={{ background: "#f5f5f5", mb: 1 }}>
                  <ListItemText primary={`${table.b_tenban} - ${table.b_trangthai == 1 ? 'Hoạt động' : 'Đã tắt'}`} />
                  <Button onClick={() => handleToggleTableStatus(table.b_id)}>
                    <VisibilityOffIcon />
                  </Button>
                  <Button onClick={() => handleEditTable(table)} color="primary">
                    <EditIcon />
                  </Button>
                  <Button onClick={() => handleDeleteTable(table.b_id)} color="error">
                    <DeleteIcon />
                  </Button>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Dialog chỉnh sửa tầng hoặc bàn */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>{editFloor ? "Chỉnh sửa tầng" : "Chỉnh sửa bàn"}</DialogTitle>
          <DialogContent>
            <TextField
              className="!mt-2"
              fullWidth
              label={editFloor ? "Tên tầng" : "Tên bàn"}
              value={editFloor ? editFloorName : editTableName}
              onChange={(e) => (editFloor ? setEditFloorName(e.target.value) : setEditTableName(e.target.value))}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setEditFloor(null);
                setEditTable(null);
                setFloorName("");
                setTableName("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={editFloor ? handleSaveFloor : handleSaveTable} variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog xác nhận xóa */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa {deleteConfirm?.type === "floor" ? "tầng" : "bàn"} này không?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Hủy</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default ManageQuanPage;
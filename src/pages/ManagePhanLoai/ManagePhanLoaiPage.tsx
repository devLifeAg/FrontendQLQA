import React, { useState, useEffect, ChangeEvent } from 'react';
import { CardContent, Button, TextField, IconButton, Typography, Box, Dialog, DialogActions, DialogTitle, Paper, DialogContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { HeaderPage } from '../../components/HeaderPage/HeaderPage';
import { showSuccessToast, showErrorToast } from '../../components/ToastService/ToastService';
import 'react-toastify/dist/ReactToastify.css';

interface PhanLoai {
  pl_id: number;
  pl_tenpl: string;
  pl_tenhinh: string;
}

const ManagePL: React.FC = () => {
  const [phanLoais, setPhanLoais] = useState<PhanLoai[]>([]);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Hàm để lấy danh sách phân loại từ API
  const fetchPhanLoais = async () => {
    try {
      const response = await fetch('https://quanlyquananapi-production.up.railway.app/api/phanloai');
      const data = await response.json();
      setPhanLoais(data.phanloai);
    } catch {
      alert('Lỗi khi tải dữ liệu.');
    }
  };

  useEffect(() => {
    fetchPhanLoais();
  }, []);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleEdit = (pl: PhanLoai) => {
    setEditingId(pl.pl_id);
    setNewName(pl.pl_tenpl);
    setPreviewImage(pl.pl_tenhinh);
    setNewImage(null);
  };

  const handleDeleteInput = () => {
    setEditingId(null);
    setNewName('');
    setPreviewImage(null);
    setNewImage(null);
  };

  const handleSave = async () => {
    if (!newName && !newImage) {
      showErrorToast('Tên phân loại và ảnh không được để trống.');
      return;
    }

    const formData = new FormData();
    formData.append('pl_tenpl', newName);

    if (newImage) {
      formData.append('pl_tenhinh', newImage); // newImage phải là một file ảnh (File object)
    }

    try {
      if (editingId === null) {
        // Gửi yêu cầu POST khi editingId là null
        const response = await fetch('https://quanlyquananapi-production.up.railway.app/api/themphanloai', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          showErrorToast('Đã xảy ra lỗi khi thêm phân loại.');
          return;
        }

        showSuccessToast('Thêm phân loại thành công!');
      } else {
        // Gửi yêu cầu PUT khi editingId khác null
        formData.append('_method', 'PUT');

        const response = await fetch(`https://quanlyquananapi-production.up.railway.app/api/suaphanloai/${editingId}`, {
          method: 'POST', // Laravel hỗ trợ phương thức PUT thông qua override bằng _method trong FormData
          body: formData,
        });

        if (!response.ok) {
          showErrorToast('Đã xảy ra lỗi khi thêm phân loại.');
          return;
        }

        showSuccessToast('Cập nhật phân loại thành công!');
      }

      // Reset lại form
      setEditingId(null);
      setNewName('');
      setNewImage(null);
      setPreviewImage(null);
      await fetchPhanLoais();

    } catch (error) {
      showErrorToast((error as Error).message);
    }
  };


  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      try {
        const response = await fetch(`https://quanlyquananapi-production.up.railway.app/api/xoaphanloai/${deleteId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          showErrorToast('Đã xảy ra lỗi khi xóa phân loại.');
          return;
        }

        showSuccessToast('Xóa phân loại thành công!');

        // Xóa thành công thì cập nhật lại state
        setPhanLoais(phanLoais.filter(pl => pl.pl_id !== deleteId));
        setOpenDialog(false);
        setDeleteId(null);
      } catch (error) {
        showErrorToast((error as Error).message);
      }
    }
  };

  return (
    <>
      <HeaderPage />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
        {/* Khu vực tải ảnh */}
        <Box sx={{ marginBottom: 2 }}>
          <Box
            component="div" // Thay đổi từ 'img' thành 'div'
            sx={{
              width: 150,
              height: 150,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F0E68C',
              border: '2px solid #8B4513',
              overflow: 'hidden',
              margin: '0 auto'
            }}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Chưa có ảnh
              </Typography>
            )}
          </Box>
        </Box>

        <Button variant="contained" component="label" sx={{
          backgroundColor: '#8B4513', // Màu nền
          color: '#F0E68C',           // Màu chữ
          marginBottom: 2,
          '&:hover': {
            backgroundColor: '#6B2F0B' // Màu nền khi hover
          }
        }}>
          Tải ảnh lên
          <input type="file" accept="image/*" hidden onChange={handleImageChange} />
        </Button>

        {/* Input nhập tên */}
        <TextField
          label="Tên phân loại"
          value={newName}
          onChange={handleNameChange}
          fullWidth
          margin="normal"
          sx={{ maxWidth: '400px', textAlign: 'center' }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, marginBottom: 2 }}>
          <Button
            variant="contained"
            onClick={handleDeleteInput}
            sx={{
              backgroundColor: '#8B0000',  // Màu đỏ thẫm
              color: '#F0E68C',             // Màu chữ
              '&:hover': {
                backgroundColor: '#5B0000'  // Màu khi hover
              }
            }}
          >
            Xóa
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: '#8B4513', // Màu nền
              color: '#F0E68C',           // Màu chữ
              '&:hover': {
                backgroundColor: '#6B2F0B' // Màu nền khi hover
              }
            }}
          >
            {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
          </Button>
        </Box>

        {/* Danh sách các phân loại */}
        <Box sx={{ width: '100%', maxWidth: 600, marginTop: 4 }}>
          {phanLoais.map(pl => (
            <Paper
              key={pl.pl_id}
              elevation={3}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
                padding: 2,
                borderRadius: 2,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                backgroundColor: '#F0E68C', // Màu xanh dương nhạt
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', padding: 0 }}>
                <Box
                  component="img"
                  src={pl.pl_tenhinh}
                  alt={pl.pl_tenpl}
                  sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 2, marginRight: 2 }}
                />
                <Typography variant="h6">{pl.pl_tenpl}</Typography>
              </CardContent>
              <div>
                <IconButton color="primary" onClick={() => handleEdit(pl)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteClick(pl.pl_id)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </Paper>
          ))}
        </Box>

        {/* Dialog xác nhận xóa */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Xóa Phân Loại?</DialogTitle>
          <DialogContent>Bạn có chắc muốn xóa phân loại này không?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Hủy
            </Button>
            <Button onClick={confirmDelete} color="error">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box></>
  );
};

export default ManagePL;

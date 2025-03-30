import { Button, List, ListItem, ListItemButton, ListItemText, Drawer, Avatar, Typography, Box } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';
import './HeaderPage.css';
import { useNavigate } from 'react-router-dom';

export const HeaderPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const chucvu: string[] = ['Chủ', 'Quản Lý', 'Thu Ngân', 'Nhân Viên'];
  const handleNavigate = (path: string) => {
    navigate(path);
    // handleMenuClose();
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); // Xóa user khỏi localStorage
    navigate("/"); // Điều hướng về trang đăng nhập
  };

  return (
    <>
      <div className='header'>
        <div className="logoContainer">
          <img src="/logo.png" alt="Logo Nhà Hàng" className="logoImage" />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#F0E68C',
              mixBlendMode: 'multiply',
            }}
          />
        </div>
        <div className='logoTitle'>
          <h1 className='headerTitle'><span>Nhà Hàng</span>
            <span> Hảo Hán</span>
            <span> 好汉</span></h1>
        </div>
        {/* Nút mở Drawer */}
        <Button className="menuButton" onClick={() => setDrawerOpen(true)}>
          <MenuIcon className="menuIcon" fontSize="medium" />
        </Button>

        {/* Drawer (Thanh sidebar) */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: 400 } }} // Điều chỉnh chiều rộng
        >
          <Box sx={{
            p: 2,
            background: 'linear-gradient(90deg, #4B2E0F, #8B4513)', // Gradient nền
            color: '#F0E68C'
          }}>
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
              <Avatar
                src="/logo.png"
                sx={{ width: 60, height: 60 }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#F0E68C',
                  mixBlendMode: 'multiply',
                  borderRadius: '50%',
                }}
              />
            </div>
            <Typography variant="h6" sx={{ mt: 1 }}>{user.u_name}</Typography>
            <Typography sx={{ mt: 1 }}>{chucvu[user.u_role]}</Typography>
          </Box>

          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/Home')}>
                <ListItemText primary="Trang Chủ" />
              </ListItemButton>
            </ListItem>


            {(user.u_role === 0 || user.u_role === 1) && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigate('/TTQ')}>
                    <ListItemText primary="Thông Tin Quán" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigate('/QLMA')}>
                    <ListItemText primary="Quản Lý Món Ăn" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
            {(user.u_role === 0 || user.u_role === 1 || user.u_role === 2) && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigate('/QLKC')}>
                    <ListItemText primary="Kết Ca" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
            {(user.u_role === 0) && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigate('/QLPL')}>
                    <ListItemText primary="Quản Lý Phân Loại" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigate('/QLTK')}>
                    <ListItemText primary="Tài Khoản" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigate('/QLDT')}>
                    <ListItemText primary="Doanh Thu" />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Đăng Xuất" />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
      </div>
    </>
  );
};

import React, { useState } from "react";
import { useEffect } from "react";
import { HeaderPage } from "../components/HeaderPage/HeaderPage";
import {
  showSuccessToast,
  showErrorToast,
} from "../components/ToastService/ToastService";

interface Account {
  id: number;
  name: string;
  username: string;
  password: string;
  role: number; // 1: admin, 2: quản lý, 3: thu ngân, 4: nhân viên order
}

const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [account, setAccount] = useState<Account>({
    id: 0,
    name: "",
    username: "",
    password: "",
    role: 1,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(
          "https://quanlyquananapi-production.up.railway.app/api/danhsachtaikhoan"
        );
        const data = await response.json();

        if (data.result === 1) {
          const formattedAccounts = data.danhsachtaikhoan.map((acc: any) => ({
            id: acc.u_id,
            name: acc.u_name,
            username: acc.u_username,
            password: "", // Không có mật khẩu từ API
            role: acc.u_role,
          }));
          setAccounts(formattedAccounts);
        } else {
          showErrorToast("Không thể lấy danh sách tài khoản!");
        }
      } catch (error) {
        showErrorToast("Lỗi kết nối đến server!");
      }
    };

    fetchAccounts();
  }, []);

  const roles = [
    { id: 0, label: "Admin" },
    { id: 1, label: "Quản lý" },
    { id: 2, label: "Thu ngân" },
    { id: 3, label: "Nhân viên order" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAccount({
      ...account,
      [name]: name === "role" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async () => {
    if (!account.username || !account.name) {
      showErrorToast("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const updatedAccount: any = {
      u_username: account.username,
      u_pass: account.password || undefined, // Không gửi password nếu không nhập mới
      u_role: account.role,
      u_name: account.name,
    };
    // console.log(updatedAccount);
    if (isEditing) {
      try {
        updatedAccount._method = "PUT";
        const response = await fetch(
          `https://quanlyquananapi-production.up.railway.app/api/suataikhoan/${account.id}`,
          {
            method: "POST", // Laravel yêu cầu dùng POST với `_method: PUT`
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedAccount),
          }
        );

        const data = await response.json();

        if (response.ok) {
          showSuccessToast(data.message);
          setAccounts(
            accounts.map((acc) =>
              acc.id === account.id
                ? {
                    ...acc,
                    name: data.user.u_name,
                    username: data.user.u_username,
                    role: parseInt(data.user.u_role),
                  }
                : acc
            )
          );
          setIsEditing(false);
          setAccount({ id: 0, name: "", username: "", password: "", role: 1 });
        } else {
          showErrorToast(data.message);
        }
      } catch (error) {
        showErrorToast("Lỗi kết nối đến server!");
      }
    } else {
      // Xử lý thêm tài khoản mới
      try {
        const response = await fetch(
          "https://quanlyquananapi-production.up.railway.app/api/taotaikhoan",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedAccount),
          }
        );

        const data = await response.json();

        if (response.ok) {
          showSuccessToast(data.message);
          setAccounts([
            ...accounts,
            {
              id: data.user.u_id,
              name: data.user.u_name,
              username: data.user.u_username,
              password: account.password,
              role: parseInt(data.user.u_role),
            },
          ]);
          setAccount({ id: 0, name: "", username: "", password: "", role: 1 });
        } else {
          showErrorToast(data.message);
        }
      } catch (error) {
        showErrorToast("Lỗi kết nối đến server!");
      }
    }
  };

  const handleEdit = (acc: Account) => {
    setAccount({ ...acc, password: "" }); // Không hiển thị mật khẩu cũ
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://quanlyquananapi-production.up.railway.app/api/xoataikhoan/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSuccessToast(data.message);

        setAccounts(accounts.filter((acc) => acc.id !== id));
      } else {
        showErrorToast(data.message);
      }
    } catch (error) {
      showErrorToast("Lỗi kết nối đến server!");
    }
  };

  const handleDeleteInput = () => {
    setAccount({
      id: 0,
      name: "",
      username: "",
      password: "",
      role: 0,
    });
    setIsEditing(false);
  };

  return (
    <>
      <HeaderPage />
      <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Quản lý tài khoản</h2>

        {/* Form nhập thông tin */}
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Tên"
            value={account.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            value={account.username}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={account.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="role"
            value={account.role}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDeleteInput}
              className="w-full p-2 text-white rounded"
              style={{
                backgroundColor: "#B22222", // Màu đỏ lửa (firebrick)
              }}
            >
              Xóa
            </button>
            <button
              onClick={handleSubmit}
              className="w-full p-2 text-white rounded"
              style={{
                backgroundColor: "#8B4513", // Màu nâu
              }}
            >
              {isEditing ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </div>

        {/* Danh sách tài khoản */}
        <h3 className="text-xl font-semibold mt-6 mb-2">Danh sách tài khoản</h3>
        <div className="space-y-2">
          {accounts
            .sort((a, b) => a.role - b.role)
            .map((acc) => (
              <div
                key={acc.id}
                className="p-3 border rounded flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleEdit(acc)}
              >
                <div>
                  <p>
                    <strong>{acc.name}</strong> (
                    {roles.find((r) => r.id === acc.role)?.label})
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn chặn sự kiện onClick của div cha
                    handleDelete(acc.id);
                  }}
                  className="text-white !bg-red-500 hover:!bg-red-600"
                >
                  Xóa
                </button>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default AccountManagement;

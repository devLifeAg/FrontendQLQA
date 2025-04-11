import React, { useState, useEffect } from "react";
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
  role: number; // 0: admin, 1: quản lý, 2: thu ngân, 3: nhân viên order
}

const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [account, setAccount] = useState<Account>({
    id: 0,
    name: "",
    username: "",
    password: "",
    role: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

  const roles = [
    { id: 0, label: "Admin" },
    { id: 1, label: "Quản lý" },
    { id: 2, label: "Thu ngân" },
    { id: 3, label: "Nhân viên order" },
  ];

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
            password: "",
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
      u_pass: account.password || undefined,
      u_role: account.role,
      u_name: account.name,
    };

    if (isEditing) {
      try {
        updatedAccount._method = "PUT";
        const response = await fetch(
          `https://quanlyquananapi-production.up.railway.app/api/suataikhoan/${account.id}`,
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
          setAccount({ id: 0, name: "", username: "", password: "", role: 0 });
        } else {
          showErrorToast(data.message);
        }
      } catch (error) {
        showErrorToast("Lỗi kết nối đến server!");
      }
    } else {
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
          setAccount({ id: 0, name: "", username: "", password: "", role: 0 });
        } else {
          showErrorToast(data.message);
        }
      } catch (error) {
        showErrorToast("Lỗi kết nối đến server!");
      }
    }
  };

  const handleEdit = (acc: Account) => {
    setAccount({ ...acc, password: "" });
    setIsEditing(true);
  };

  const handleDeleteClick = (id: number) => {
    setAccountToDelete(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (accountToDelete === null) return;

    try {
      const response = await fetch(
        `https://quanlyquananapi-production.up.railway.app/api/xoataikhoan/${accountToDelete}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSuccessToast(data.message);
        setAccounts(accounts.filter((acc) => acc.id !== accountToDelete));
      } else {
        showErrorToast(data.message);
      }
    } catch (error) {
      showErrorToast("Lỗi kết nối đến server!");
    }

    setShowConfirmDelete(false);
    setAccountToDelete(null);
  };

  const handleDeleteInput = () => {
    setAccount({ id: 0, name: "", username: "", password: "", role: 0 });
    setIsEditing(false);
  };

  return (
    <>
      <HeaderPage />
      <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Quản lý tài khoản</h2>

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
              style={{ backgroundColor: "#B22222" }}
            >
              Xóa
            </button>
            <button
              onClick={handleSubmit}
              className="w-full p-2 text-white rounded"
              style={{ backgroundColor: "#8B4513" }}
            >
              {isEditing ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </div>

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
                    e.stopPropagation();
                    handleDeleteClick(acc.id);
                  }}
                  className="px-3 py-1 text-white !bg-red-500 hover:!bg-red-600 rounded"
                >
                  Xóa
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg z-50">
            <p className="mb-4">Bạn có chắc chắn muốn xóa tài khoản này?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 !bg-red-600 text-white rounded"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountManagement;

// src/utils/ToastService.ts
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showSuccessToast = (message: string) => {
  toast.success(message, { position: 'top-center' });
};

export const showErrorToast = (message: string) => {
  toast.error(message, { position: 'top-center' });
};


import Swal from 'sweetalert2';

// Toast notification (top-end)
const Toast = Swal.mixin({
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

// Full-screen modal alerts
const Alert = {
  success: (msg, title = 'Success') => {
    Swal.fire({ icon: 'success', title, text: msg });
  },
  error: (msg, title = 'Error') => {
    Swal.fire({ icon: 'error', title, text: msg });
  },
  warning: (msg, title = 'Warning') => {
    Swal.fire({ icon: 'warning', title, text: msg });
  },
  info: (msg, title = 'Info') => {
    Swal.fire({ icon: 'info', title, text: msg });
  },
  confirm: async (msg, title = 'Are you sure?') => {
    const result = await Swal.fire({
      icon: 'warning',
      title,
      text: msg,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });
    return result.isConfirmed;
  },
};

export { Toast, Alert };

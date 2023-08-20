import { useAlert } from '@context/AlertContext';
import { Alert, Box } from '@mui/material';

export const AlertBar = () => {
  const { alert, setAlert } = useAlert();

  return (
    <Box>
      {alert && (
        <Alert
          severity={alert.severity}
          variant={alert.variant}
          onClose={() => {
            setAlert(null);
          }}
        >
          {alert.text}
        </Alert>
      )}
    </Box>
  );
};

import { useAlerts } from "@/hooks/useAlerts";

export function useResponseValidator() {
  const { showSuccessAlert, showErrorAlert, showWarningAlert } = useAlerts();

  const showAlertByStatusCode = (statusCode: number, message: string) => {
    switch (statusCode) {
      case 400:
        showErrorAlert("Invalid Email", message);
        break;
      case 401:
      case 404:
        showErrorAlert("Email Not Found", message);
        break;
      case 403:
        showWarningAlert("Account Locked", message);
        break;
      case 429:
        showWarningAlert("Too Many Requests", message);
        break;
      case 500:
      case 502:
      case 503:
        showErrorAlert("Service Unavailable", message);
        break;
      case 200:
      case 201:
      case 204:
        showSuccessAlert("Success", message);
        break;
      default:
        showErrorAlert("Request Failed", message);
        break;
    }
  };

  return { showAlertByStatusCode };
}
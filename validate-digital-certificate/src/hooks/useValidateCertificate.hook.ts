import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth.hook";
import { ValidateCertificateResponse } from "../certificate.model";

export const useValidateCertificate = () => {
  const axios = useAxiosWithAuth();

  const validateCertificate = async (
    certFileName: string
  ): Promise<ValidateCertificateResponse | undefined> => {
    try {
      const response = await axios.post(`/validate-script`, { certFileName });
      return response.data;
    } catch (e) {
      alert(
        `Algo deu errado. Consulte o console do navegador.${JSON.stringify(e)}`
      );
      console.log(e);
      console.error(e);
    }
  };

  const uploadCertificate = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("certificate", file);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const response = await axios.post(`/upload-script`, formData, config);

      return response.data;
    } catch (e) {
      // alert("Algo deu errado. Consulte o console do navegador.");
      console.error(e);
    }
  };

  const cleanCertificateDir = async () => {
    try {
      const response = await axios.delete(`/clear-uploads`);

      return response.data;
    } catch (e) {
      // alert("Algo deu errado. Consulte o console do navegador.");
      console.error(e);
    }
  };

  return {
    validateCertificate,
    uploadCertificate,
    cleanCertificateDir,
  };
};

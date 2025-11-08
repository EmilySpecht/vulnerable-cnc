import React, { useEffect, useState } from "react";
import {
  Certificate,
  FileWithId,
  ValidateCertificateResponse,
} from "../certificate.model";
import { useValidateCertificate } from "./useValidateCertificate.hook";

export const useLoadCertificates = () => {
  const [certificate, setCertificate] = useState<FileWithId[]>([]);
  const [certData, setCertData] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<FileWithId>();
  const { uploadCertificate, validateCertificate, cleanCertificateDir } =
    useValidateCertificate();

  useEffect(() => {
    cleanCertificateDir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadCNCScript = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];

    try {
      if (file) {
        const response = await uploadCertificate(file);

        setCertificate([
          ...certificate,
          { id: response?.fileName ?? response?.name, isExec: false },
        ]);
      }
    } catch (e) {
      alert(`Algo deu errado, ${e}`);
    }
  };

  const execCNCScript = async (id: string) => {
    const certificateToValidate = certificate.find((cert) => cert.id === id);

    if (certificateToValidate) {
      const isExecConcluded: ValidateCertificateResponse | undefined =
        await validateCertificate(certificateToValidate.id);

      let isExec = !!isExecConcluded?.result.isExec;

      setCertificate(
        certificate.map((cert) => {
          if (cert.id === id) {
            const certificate = {
              ...cert,
              isExec,
              result: isExecConcluded?.result.model,
            };

            setSelected(certificate);
            return certificate;
          }
          return cert;
        })
      );
    }
  };

  useEffect(() => {
    setCertData(certificate.map((cert) => ({ id: cert.id })));
  }, [certificate]);

  return {
    certData,
    uploadCNCScript,
    execCNCScript,
    selected,
    certificate,
  };
};

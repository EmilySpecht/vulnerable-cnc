export type Certificate = {
  id: string;
};

export type FileWithId = {
  id: string;
  isExec: boolean;
  result?: any;
};

export type Details = {
  model: any;
  isExec: boolean;
};

export type ValidateCertificateResponse = {
  message: string;
  result: Details;
};

import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import cncImage from "./images/cnc.png";
import { useLoadCertificates } from "./hooks/useLoadCertificates.hook";
import { Certificate, FileWithId } from "./certificate.model";
import Login from "./login";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function MainContent() {
  const { certData, uploadCNCScript, execCNCScript, selected } =
    useLoadCertificates();

  return (
    <div className="main">
      <div className="certificates-container">
        <CDList
          certData={certData}
          uploadCertificateEnduser={uploadCNCScript}
          onClick={execCNCScript}
          selected={selected}
        />
      </div>
      {selected && <Status isExec={selected.isExec} result={selected.result} />}
    </div>
  );
}
type StatusProps = {
  isExec?: boolean;
  result: any;
};

const Status = ({ isExec, result }: StatusProps) => {
  return (
    <div className="status-container">
      <div className={`result-status ${isExec ? "green-status" : ""}`}>
        {isExec ? "Script executado" : "Script não executado"}
      </div>
      <span>Resultado do script</span>
      <div>{result}</div>
    </div>
  );
};

export default App;

type CDListProps = {
  certData: Certificate[];
  uploadCertificateEnduser: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: (value: string) => void;
  selected?: FileWithId;
};

const CDList = ({
  certData,
  uploadCertificateEnduser,
  onClick,
  selected,
}: CDListProps) => {
  return (
    <div className="CD-container">
      <p className="info-text">
        {certData.length > 0
          ? "Selecione um script para criar seu modelo CNC personalizado."
          : "Adicione scripts para criar modelos CNC personalizados."}
      </p>
      <div className="listing">
        {certData.map(({ id }) => {
          const isExec = selected?.isExec;
          return (
            <div
              className={`default-card ${
                selected?.id === id ? "default-card--selected" : ""
              }`}
              onClick={() => onClick(id)}
            >
              {selected?.id === id && (
                <div className={`flag ${isExec ? "trusted" : "untrusted"}`}>
                  {isExec ? "Executado" : "Nao executado"}
                </div>
              )}
              <img src={cncImage} className="image" alt="cnc" />
              <span>{id}</span>
            </div>
          );
        })}
      </div>
      <input
        type="file"
        className="validCDsInput"
        onChange={uploadCertificateEnduser}
      />
    </div>
  );
};

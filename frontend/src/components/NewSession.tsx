import { RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NewSession() {
    const navigate = useNavigate();
    const onNewSession = () => {
        navigate("/");
    };

    return (
        <div className="newSessionSized">
            <div style={{justifyContent: "center", display: "flex"}}>
                <button type="button" className="button primary" onClick={onNewSession} style={{gap: "8px" }}>
                    <RotateCcw className="icon" />
                    New Session
                </button>
            </div>
        </div>
    );
}

export default NewSession;
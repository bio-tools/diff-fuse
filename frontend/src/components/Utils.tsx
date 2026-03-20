import { RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Utils() {
    const navigate = useNavigate();
    const onNewSession = () => {
        navigate("/");
    };

    return (
        <div className="utilsSized">
            <div style={{ justifyContent: "center", display: "flex" }}>
                <button type="button" className="button primary combined" onClick={onNewSession}>
                    <RotateCcw className="icon" />
                    New Session
                </button>
            </div>
        </div>
    );
}

export default Utils;
import { Info, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Utils.module.css";
import { Modal } from "../shared/cards/Modal";
import React from "react";
import { Info as InfoText } from "./Info";

import logoUrl from "../../assets/difffuse.svg";

function Logo() {
    return <img src={logoUrl} alt="Logo" className={styles.logo} />;
}

export function Utils() {
    const navigate = useNavigate();
    const onNewSession = () => {
        navigate("/");
    };

    const [previewOpen, setPreviewOpen] = React.useState(false);

    const onInfo = async () => {
        setPreviewOpen(true);
    };

    return (
        <>
            <div className="utilsSized">
                <div className={styles.container}>
                    <div className={styles.stack}>
                        <Logo />
                        <div className={styles.buttonStack}>
                            <button type="button" className="button primary combined" onClick={onNewSession}>
                                <RotateCcw className="icon" />
                                New Session
                            </button>

                            <button type="button" className="button primary combined" onClick={onInfo}>
                                <Info className="icon" />
                                Info
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                title="Diff Fuse Info"
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
            >
                <InfoText />
            </Modal>
        </>
    );
}

export default Utils;
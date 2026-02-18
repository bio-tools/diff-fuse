import React from 'react';
import RawJsonsPanel from '../components/RawJsonsPanel';
import DiffFusePanel from '../components/DiffFusePanel';

import styles from './Main.module.css';

export default function Main() {

    return (
        <div className={styles.page}>
            <div className={styles.contentRow}>
                <RawJsonsPanel />
            </div>
            <div className={styles.contentRow}>
                <DiffFusePanel />
            </div>
        </div>
    );
}
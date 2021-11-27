import React, { ComponentPropsWithoutRef } from "react";

import styles from "./Row.module.scss";

export const Row = (props: ComponentPropsWithoutRef<"div">) => {
	const { children, ...attrs } = props;

	return (
		<div className={styles["row"]} {...attrs}>
			{children}
		</div>
	);
};

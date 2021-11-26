import React, { ComponentPropsWithoutRef } from "react";

import styles from "./Row.module.scss";
import stylesCss from "./Row.module.css";

export const Row = (props: ComponentPropsWithoutRef<"div">) => {
	const { children, ...attrs } = props;

	return (
		<div className={styles["row"] + " " + stylesCss["something"]} {...attrs}>
			{children}
		</div>
	);
};

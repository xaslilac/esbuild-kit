import React, { ComponentPropsWithoutRef } from "react";

// import styles from "./Icon.module.scss";
import { ReactComponent as Trees } from "./Trees.svg";

export interface IconProps extends ComponentPropsWithoutRef<"div"> {
	name: IconName;
}

export type IconName = "Trees";

export const Icon = (props: ComponentPropsWithoutRef<"div">) => {
	const { children, ...attrs } = props;

	return (
		<div {...attrs}>
			<Trees />
		</div>
	);
};

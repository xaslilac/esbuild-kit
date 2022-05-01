import "@nova/ui/css";
import { Row } from "@nova/ui";
import React from "react";
import { render } from "react-dom";

render(
	<Row>
		<p>Hi!</p>
	</Row>,
	document.querySelector("#app"),
);

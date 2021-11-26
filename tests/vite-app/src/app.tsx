import { Row } from "@nova/ui";
import { hi } from "@nova/ui/css";

import React from "react";
import { render } from "react-dom";

render(
	<Row>
		<p>Hi!</p>
	</Row>,
	document.querySelector("#app"),
);

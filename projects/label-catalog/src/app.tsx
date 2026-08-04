import React from "react";

import CataloguePage, { labelFromLocation } from "../../shared/src/components/catalogue_page";

/**
 * Custom-app entry point. Spicetify registers `/label-catalog` as a real route,
 * so this only has to track the label in the query string and hand it over.
 */
const App = (): React.ReactElement => {
	const [label, setLabel] = React.useState(labelFromLocation);

	// The app stays mounted across navigations, so react to the query string changing.
	React.useEffect(() => Spicetify.Platform.History.listen(() => setLabel(labelFromLocation())), []);

	return <CataloguePage label={label} />;
};

export default App;

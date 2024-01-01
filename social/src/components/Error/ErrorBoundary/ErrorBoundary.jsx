import React from "react";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	/* componentDidCatch(error, info) {
		logErrorToMyService(error, info.componentStack);
	} */

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex-center">
					<div className="error-container">						
						<div className="message">
							<span>Something went wrong</span>
						</div>
					</div>
				</div>    
			)
		}
		return this.props.children;
	}
}

export default ErrorBoundary;

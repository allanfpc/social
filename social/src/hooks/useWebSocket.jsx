import { useCallback, useEffect, useRef, useState } from "react";
import { CustomError, useErrorContext } from "../contexts/ErrorContext";

export const useWebSocket = (url) => {
	const { showError } = useErrorContext();
	const [value, setValue] = useState(null);
	const readyState = useRef(null);
	const ws = useRef(null);

	useEffect(() => {
		ws.current = new WebSocket(url);

		ws.current.onopen = () => (readyState.current = ws.current.readyState);
		ws.current.onclose = (response) => {
			if (response.reason !== "") {
				const data = JSON.parse(response.reason);
				if (data && data.error) {
					showError(data.code);
				}
			}
			readyState.current = ws.current.readyState;
		};
		ws.current.onerror = () => showError(500);

		const wsCurrent = ws.current;

		return () => {
			wsCurrent.close();
		};
	}, [url]);

	useEffect(() => {
		if (!ws.current) return;
		ws.current.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (data) {
				if (data.type === "error") {
					showError(new CustomError(500, data.message));
				} else {
					setValue(data);
				}
			}
		};
	}, [setValue, url]);

	const sendJsonMessage = useCallback((data) => {
		if (ws.current.readyState === ws.current.OPEN) {
			ws.current.send(JSON.stringify(data));
		}
	}, []);

	return { sendJsonMessage, readyState, value };
};

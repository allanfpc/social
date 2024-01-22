import { useState, useEffect, useRef, memo } from "react";

import Button from "../../../components/Button";

import { fetchAction } from "../../../components/api/api";
import { useErrorContext } from "../../../contexts/ErrorContext";
import { useGlobalModalContext } from "../../../contexts/ModalContext";

const ImageContainer = ({ user, image, type, onImageChange, fileUpload }) => {
	const { showModal, hideModal } = useGlobalModalContext();
	const { showError } = useErrorContext();
	const [croppedSrc, setCroppedSrc] = useState(null);
	async function saveUpdate() {
		const randomId = crypto.randomUUID();
		const formData = new FormData();
		formData.append("files", image);

		const upload = async (formData, path) => {
			const { data, error } = await fetchAction({
				path,
				options: {
					method: "POST",
					headers: {},
					body: formData
				}
			});

			if (error) {
				if (error.code === 422 || error.code === 413) {
					return showError("TOAST_ERROR", {
						error: error.message,
						files: error.files
					});
				}

				return error.code === 401 ? showModal(401) : showError(error);
			}

			return data;
		};

		const response = await upload(
			formData,
			`upload?field=files&type=${type}&sizes=680&randomId=${randomId}`
		);

		if (response && response.success) {
			formData.delete("files");
			const file = new File([croppedSrc], image.name + "cropped", {
				type: image.type
			});
			formData.append("file", file);
			const response = await upload(
				formData,
				`upload?field=file&type=${type}&randomId=${randomId}&cropped=true`
			);

			if (response && response.success) {
				const { data, error } = await fetchAction({
					path: `users/${user.id}?type=${type}`,
					options: {
						method: "PUT",
						body: JSON.stringify({
							value: response.filename
						})
					}
				});

				if (error) {
					return error.code === 401 ? showModal(401) : showError(error);
				}

				if (data && data.success) {
					if (fileUpload) {
						fileUpload.value = "";
					}
					onImageChange(data.filename);
					hideModal();
				}
			}
		}
	}

	return (
		<>
			<div className="preview">
				<div className="container">
					<Canvas image={image} setCroppedSrc={setCroppedSrc} />
				</div>
			</div>
			<div className="modal__actions">
				<div>
					<Button title="Save" onClick={saveUpdate} />
				</div>
			</div>
		</>
	);
};

const Crop = ({ canvasRef, setCroppedSrc, type }) => {
	const [position, setPosition] = useState({ x: 0, y: 275 - 140 });
	const initialPosition = useRef({ x: 0, y: 275 - 140 });
	const cropCanvasRef = useRef(null);
	const cropRef = useRef(null);
	const isMousePressed = useRef(false);

	useEffect(() => {
		const cropCanvas = cropCanvasRef.current;
		const drawCrop = () => {
			const canvas = canvasRef.current;
			cropCanvas.width = canvas.width;
			cropCanvas.height = 138;

			cropCanvas
				.getContext("2d")
				.drawImage(
					canvas,
					0,
					position.y,
					canvas.width,
					cropCanvas.height,
					0,
					0,
					canvas.width,
					cropCanvas.height
				);
			cropCanvas.toBlob(
				(blob) => {
					setCroppedSrc(blob);
				},
				type,
				1
			);
		};

		if (cropCanvas) {
			drawCrop();
		}
	}, [position, canvasRef]);

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (isMousePressed.current && cropRef.current) {
				const offsetY = e.clientY - initialPosition.current.y - 150;
				if (
					initialPosition.current.y + offsetY + 140 >
					canvasRef.current.offsetHeight - 1
				) {
					return;
				}
				setPosition((prevPosition) => ({
					x: prevPosition.x,
					y: Math.max(0, initialPosition.current.y + offsetY)
				}));
			}
		};

		const handleMouseUp = () => {
			isMousePressed.current = false;
		};

		const handleMouseDown = (e) => {
			isMousePressed.current = true;
			initialPosition.current = { x: e.clientX, y: e.clientY };
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		cropRef.current.addEventListener("mousedown", handleMouseDown);

		const cropRefCurrent = cropRef.current;

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			if (cropRefCurrent) {
				cropRefCurrent.removeEventListener("mousedown", handleMouseDown);
			}
		};
	}, [canvasRef]);

	return (
		<div
			style={{ top: `${position.y > -1 && position.y}px` }}
			ref={cropRef}
			className="crop"
		>
			<canvas ref={cropCanvasRef} />
		</div>
	);
};

const Canvas = memo(function Canvas({ image, setCroppedSrc }) {
	const [crop, setCrop] = useState(false);
	const canvasRef = useRef(null);
	const canvasWrapperRef = useRef(null);
	useEffect(() => {
		const drawImage = () => {
			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = function (event) {
					const img = new Image();
					img.onload = function () {
						const containerWidth = canvasWrapperRef.current.clientWidth;
						const containerHeight = canvasWrapperRef.current.clientHeight;

						const aspectRatio = canvas.width / canvas.height;
						let newWidth = containerWidth;
						let newHeight = containerWidth / aspectRatio;

						if (newHeight > containerHeight) {
							newHeight = containerHeight;
							newWidth = containerHeight * aspectRatio;
						}

						canvas.width = newWidth;
						canvas.height = containerHeight;

						context.drawImage(img, 0, 0, canvas.width, canvas.height);
						setCrop(true);
						resolve();
					};
					img.src = event.target.result;
				};
				reader.readAsDataURL(image);
			});
		};

		if (image) {
			drawImage();
		}
	}, [image]);

	return (
		<>
			{crop && (
				<div className="crop-container">
					<Crop
						canvasRef={canvasRef}
						setCroppedSrc={setCroppedSrc}
						type={image.type}
					/>
				</div>
			)}
			<div ref={canvasWrapperRef} className="canvas-wrapper">
				<canvas ref={canvasRef} />
			</div>
		</>
	);
});

export default ImageContainer;

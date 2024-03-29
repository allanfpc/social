import { lazy, Suspense, useState } from "react";

import Button from "../Button";
const MartPicker = lazy(() => import("@emoji-mart/react"));

const Picker = ({ message, setMessage, msgBoxRef }) => {
	const [showPicker, setShowPicker] = useState(null);

	function hidePicker() {
		if (showPicker) {
			setShowPicker(false);
		}
	}

	function togglePicker(e) {
		e.stopPropagation();
		setShowPicker(!showPicker);
	}

	function sliceText(text, initIndex, finalIndex) {
		return Array.from(text).slice(initIndex, finalIndex).join("");
	}

	function chooseEmoji(e) {
		const selectedText = window.getSelection().toString();

		const text = message.message;
		let lastIndex = message.lastIndex;
		let emojiIndex = msgBoxRef.current.selectionStart;

		let init = sliceText(text, 0, lastIndex);
		let last = sliceText(text, lastIndex, message.message.length);

		if (selectedText) {
			init = text.substring(0, msgBoxRef.current.selectionStart);
			last = text
				.substring(msgBoxRef.current.selectionStart, text.length)
				.replace(selectedText, "");

			const regex = /[\p{L}]?.+/gimu;

			const match = sliceText(selectedText, 0, selectedText.length).match(
				regex
			)?.[0];

			let charCounter = 0;

			if (match) {
				for (let i = 0; i < match.length; i++) {
					const char = sliceText(match, i, i + 1);
					if (char) {
						charCounter = charCounter + 1;
					}
				}
			}

			lastIndex = Math.max(0, lastIndex - charCounter);
		}

		if (selectedText) {
			emojiIndex = msgBoxRef.current.selectionEnd - selectedText.length;
		}

		setMessage({
			message: init + e.native + last,
			lastIndex: lastIndex + 1,
			lastEmojiIndex: emojiIndex + 2
		});
	}

	return (
		<>
			<div>
				<Button onClick={(e) => togglePicker(e)} label="Open Emoji Picker">
					<svg
						aria-hidden="true"
						focusable="false"
						xmlns="http://www.w3.org/2000/svg"
						height="24"
						viewBox="0 -960 960 960"
						width="24"
					>
						<path d="M616.244-527.693q21.832 0 37.025-15.283 15.192-15.282 15.192-37.115 0-21.832-15.283-37.024t-37.115-15.192q-21.832 0-37.024 15.283-15.193 15.282-15.193 37.115 0 21.832 15.283 37.024t37.115 15.192Zm-272.307 0q21.832 0 37.024-15.283 15.193-15.282 15.193-37.115 0-21.832-15.283-37.024t-37.115-15.192q-21.832 0-37.025 15.283-15.192 15.282-15.192 37.115 0 21.832 15.283 37.024t37.115 15.192ZM480-272.309q62.615 0 114.461-35.038T670.922-400H289.078q24.615 57.615 76.461 92.653Q417.385-272.309 480-272.309Zm.067 172.308q-78.836 0-148.204-29.92-69.369-29.92-120.682-81.21-51.314-51.291-81.247-120.629-29.933-69.337-29.933-148.173t29.92-148.204q29.92-69.369 81.21-120.682 51.291-51.314 120.629-81.247 69.337-29.933 148.173-29.933t148.204 29.92q69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173t-29.92 148.204q-29.92 69.369-81.21 120.682-51.291 51.314-120.629 81.247-69.337 29.933-148.173 29.933ZM480-480Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z" />
					</svg>
				</Button>
			</div>
			{showPicker && (
				<Suspense>
					<MartPicker
						onEmojiSelect={(e) => chooseEmoji(e)}
						onClickOutside={hidePicker}
					/>
				</Suspense>
			)}
		</>
	);
};

export default Picker;

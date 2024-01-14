import { useEffect, useState } from "react";

import Textarea from "../../Textarea";

const reportOptions = [
	{
		name: "abuse",
		message: "This post abuse"
	},
	{
		name: "spam",
		message: "This post is spam"
	},
	{
		name: "inadequate",
		message: "This post contains inadequate content"
	},
	{
		name: "other",
		message: "Other"
	}
];

const Report = () => {
	const [checked, setChecked] = useState(
		new Array(reportOptions.length).fill(false)
	);
	const [message, setMessage] = useState(
		sessionStorage.getItem("report")?.message || ""
	);

	useEffect(() => {
		const causes = [];
		checked.forEach((opt, i) => {
			if (opt) {
				causes.push(reportOptions[i].name);
			}
		});

		sessionStorage.setItem(
			"report",
			JSON.stringify({
				causes,
				message
			})
		);
	}, [message, checked]);
	const handleOnChange = (i) => {
		const updatedCheckedState = checked.map((opt, index) =>
			index === i ? !opt : opt
		);

		setChecked(updatedCheckedState);
	};

	const handleMsgChange = (e) => {
		setMessage(e.target.value);
	};

	return (
		<div className="report">
			<h1 className="title">Report</h1>
			<div className="report-body">
				<form action="">
					<div className="form">
						<div className="options">
							{reportOptions.map((opt, i) => (
								<div key={i} className="option">
									<div>
										<input
											onChange={() => handleOnChange(i)}
											type="checkbox"
											name={opt.name}
											id={opt.name}
											checked={checked[i]}
											value={opt.name}
										/>
									</div>
									<div className={`flex label`}>
										<label
											className="bold-16 text-white capitalize"
											htmlFor="test"
										>
											{opt.message}
										</label>
									</div>
								</div>
							))}
						</div>
						<Textarea
							type="text"
							name={"report-message"}
							id={"report-message"}
							placeholder={"Write a message"}
							value={message}
							onChange={(e) => handleMsgChange(e)}
							rows={4}
						/>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Report;

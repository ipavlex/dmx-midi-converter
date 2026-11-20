import { useEffect, useState } from "react";
import {
	Activity,
	AudioLines,
	Cable,
	Cpu,
	Grid3X3,
	Gauge,
	Network,
	Plus,
	Radio,
	Settings,
	SlidersHorizontal,
	Wifi,
	ChevronRight,
	Play,
	Pause,
	Trash2,
	Edit3,
	X,
	Check,
	Sparkles,
} from "lucide-react";
type Page = "overview" | "monitor" | "mapping" | "connections" | "settings";
type M = {
	id: number;
	on: boolean;
	dmx: number;
	type: "CC" | "NOTE";
	mch: number;
	num: number;
	name: string;
	dest: string;
	threshold: number;
};
const seed: M[] = [
	{
		id: 1,
		on: true,
		dmx: 1,
		type: "CC",
		mch: 1,
		num: 7,
		name: "Main Volume",
		dest: "USB",
		threshold: 20,
	},
	{
		id: 2,
		on: true,
		dmx: 2,
		type: "CC",
		mch: 1,
		num: 11,
		name: "Expression",
		dest: "USB",
		threshold: 20,
	},
	{
		id: 3,
		on: true,
		dmx: 3,
		type: "NOTE",
		mch: 1,
		num: 60,
		name: "QLab Cue 1",
		dest: "USB",
		threshold: 20,
	},
	{
		id: 4,
		on: true,
		dmx: 4,
		type: "NOTE",
		mch: 1,
		num: 61,
		name: "QLab Cue 2",
		dest: "USB",
		threshold: 20,
	},
	{
		id: 5,
		on: false,
		dmx: 8,
		type: "CC",
		mch: 2,
		num: 1,
		name: "Modulation",
		dest: "USB",
		threshold: 20,
	},
];
export default function App() {
	const [page, setPage] = useState<Page>("overview"),
		[vals, setVals] = useState<number[]>(Array(512).fill(0)),
		[stream, setStream] = useState(true),
		[demo, setDemo] = useState(true),
		[maps, setMaps] = useState(seed),
		[bank, setBank] = useState(0),
		[selected, setSelected] = useState(1),
		[wifi, setWifi] = useState("AP"),
		[editing, setEditing] = useState<M | null>(null);
	useEffect(() => {
		if (!demo || !stream) return;
		const t = setInterval(
			() =>
				setVals((v) => {
					let n = [...v];
					for (let k = 0; k < 8; k++) {
						let i = Math.floor(Math.random() * 40);
						n[i] = Math.floor(Math.random() * 256);
					}
					n[0] = (n[0] + 5) % 256;
					n[1] = Math.max(
						0,
						Math.min(255, n[1] + (Math.random() > 0.5 ? 8 : -8)),
					);
					n[2] = Math.random() > 0.9 ? 255 : 0;
					n[3] = Math.random() > 0.92 ? 255 : 0;
					return n;
				}),
			150,
		);
		return () => clearInterval(t);
	}, [demo, stream]);
	const nav: [Page, string, any][] = [
		["overview", "Overview", Gauge],
		["monitor", "DMX Monitor", Grid3X3],
		["mapping", "Mapping", SlidersHorizontal],
		["connections", "Connections", Network],
		["settings", "Settings", Settings],
	];
	const active = maps.filter((m) => m.on).length;
	const save = (m: M) => {
		setMaps((prev) =>
			editing && editing.id !== 0
				? prev.map((x) => (x.id === editing.id ? m : x))
				: [...prev, { ...m, id: Date.now() }],
		);
		setEditing(null);
	};
	return (
		<div className="shell">
			<aside className="sidebar">
				<div className="brand">
					<div className="logo">
						<AudioLines />
					</div>
					<div>
						<b>DMX MIDI</b>
						<small>CONVERTER · PREVIEW</small>
					</div>
				</div>
				<div className="device">
					<Cpu />
					<div>
						<b>DMX MIDI Converter</b>
						<small>
							<i /> Demo device
						</small>
					</div>
				</div>
				<label className="nav-caption">DEVICE</label>
				{nav.map(([id, title, Icon]) => (
					<button
						key={id}
						className={"nav " + (page === id ? "active" : "")}
						onClick={() => setPage(id)}
					>
						<Icon size={17} />
						{title}
						{id === "monitor" && <small>512</small>}
					</button>
				))}
				<div className="side-bottom">
					<div className="demo">
						<Sparkles />
						<div>
							<b>Demo Mode</b>
							<small>Simulated DMX data</small>
						</div>
						<Toggle on={demo} set={setDemo} />
					</div>
					<small className="version">UI preview · v0.1.0</small>
				</div>
			</aside>
			<main>
				<header>
					<span>
						Device <ChevronRight size={13} />
						<b>{nav.find((n) => n[0] === page)?.[1]}</b>
					</span>
					<div>
						<label className="pill">
							<Sparkles size={13} /> SIMULATION
						</label>
						<div className="avatar">DM</div>
					</div>
				</header>
				<section className="body">
					{page === "overview" && (
						<>
							<Heading
								title="Overview"
								eyebrow="DEVICE OVERVIEW"
								desc="Live status and activity from your DMX-to-MIDI converter."
								action={
									<button
										className="primary"
										onClick={() => {
											setPage("mapping");
											setEditing({
												id: 0,
												on: true,
												dmx: selected,
												type: "CC",
												mch: 1,
												num: 7,
												name: "",
												dest: "USB",
												threshold: 20,
											});
										}}
									>
										<Plus size={15} /> Add mapping
									</button>
								}
							/>
							<div className="signal">
								<Radio />
								<div>
									<b>DMX signal detected</b>
									<small>Universe 1 · 250 kbit/s · 8N2</small>
								</div>
								<div className="signal-right">
									<span className="led" />
									ONLINE
									<button
										className="quiet"
										onClick={() => setStream(!stream)}
									>
										{stream ? (
											<Pause size={14} />
										) : (
											<Play size={14} />
										)}{" "}
										{stream ? "Pause demo" : "Resume"}
									</button>
								</div>
							</div>
							<div className="stats">
								<Stat
									icon={Activity}
									title="DMX channels"
									value="512"
									note="Universe capacity"
								/>
								<Stat
									icon={SlidersHorizontal}
									title="Active mappings"
									value={String(active)}
									note={`${maps.length} configured`}
								/>
								<Stat
									icon={Cable}
									title="MIDI outputs"
									value="1 / 3"
									note="USB enabled · demo"
								/>
								<Stat
									icon={Wifi}
									title="Network"
									value="AP Ready"
									note="DMX-MIDI-Setup"
								/>
							</div>
							<div className="two">
								<section className="panel">
									<PanelHead
										title="DMX activity"
										subtitle="Channel levels · Universe 1"
										link="Open monitor"
										onClick={() => setPage("monitor")}
									/>
									<div className="meters">
										{vals.slice(0, 24).map((v, i) => (
											<div key={i} className="meter">
												<div className="track">
													<i
														style={{
															height: `${(v / 255) * 100}%`,
														}}
													/>
												</div>
												<small>
													{String(i + 1).padStart(
														3,
														"0",
													)}
												</small>
											</div>
										))}
									</div>
									<footer>
										Active values{" "}
										<b>
											{vals.filter((v) => v > 0).length} /
											512
										</b>
									</footer>
								</section>
								<section className="panel">
									<PanelHead
										title="MIDI activity"
										subtitle="Recent simulated events"
									/>
									<Event
										type="CC"
										text="CC 7 · Main Volume"
										val={Math.round((vals[0] * 127) / 255)}
									/>
									<Event
										type="CC"
										text="CC 11 · Expression"
										val={Math.round((vals[1] * 127) / 255)}
									/>
									<Event
										type="NOTE"
										text="Note 60 · QLab Cue 1"
										val={vals[2] > 20 ? 127 : 0}
									/>
									<Event
										type="NOTE"
										text="Note 61 · QLab Cue 2"
										val={vals[3] > 20 ? 127 : 0}
									/>
									<footer>
										Preview only <b>USB MIDI</b>
									</footer>
								</section>
							</div>
							<section className="panel">
								<PanelHead
									title="Quick mapping"
									subtitle="Configured assignments"
									link="Manage mappings"
									onClick={() => setPage("mapping")}
								/>
								<Table maps={maps.slice(0, 4)} />
							</section>
						</>
					)}
					{page === "monitor" && (
						<>
							<Heading
								title="DMX Monitor"
								eyebrow="DMX512 · UNIVERSE 1"
								desc="Inspect channel levels and manipulate values in simulation."
								action={
									<button
										className="secondary"
										onClick={() => setStream(!stream)}
									>
										{stream ? (
											<Pause size={14} />
										) : (
											<Play size={14} />
										)}{" "}
										{stream
											? "Pause stream"
											: "Start stream"}
									</button>
								}
							/>
							<div className="bankbar">
								<span>Bank</span>
								{Array.from({ length: 16 }, (_, i) => (
									<button
										key={i}
										className={bank === i ? "chosen" : ""}
										onClick={() => setBank(i)}
									>
										{i + 1}
									</button>
								))}
								<div className="legend">
									<i /> Mapped
								</div>
							</div>
							<div className="channels">
								{vals
									.slice(bank * 32, bank * 32 + 32)
									.map((v, i) => {
										let ch = bank * 32 + i + 1;
										return (
											<button
												key={ch}
												className={
													"channel " +
													(selected === ch
														? "sel"
														: "") +
													(maps.some(
														(m) =>
															m.on &&
															m.dmx === ch,
													)
														? " mapped"
														: "")
												}
												onClick={() => setSelected(ch)}
											>
												<span className="chhead">
													{String(ch).padStart(
														3,
														"0",
													)}{" "}
													{maps.some(
														(m) =>
															m.on &&
															m.dmx === ch,
													) && <i />}
												</span>
												<div className="chbar">
													<i
														style={{
															height: `${(v / 255) * 100}%`,
														}}
													/>
												</div>
												<b>{v}</b>
												<small>
													{Math.round(
														(v / 255) * 100,
													)}
													%
												</small>
											</button>
										);
									})}
							</div>
							<section className="panel selected">
								<div>
									<label>
										CHANNEL{" "}
										{String(selected).padStart(3, "0")}
									</label>
									<h3>DMX Channel {selected}</h3>
									<small>
										{maps.some(
											(m) => m.on && m.dmx === selected,
										)
											? "Mapped to MIDI"
											: "No mapping assigned"}
									</small>
								</div>
								<strong>{vals[selected - 1]}</strong>
								<input
									type="range"
									min="0"
									max="255"
									value={vals[selected - 1]}
									onChange={(e) =>
										setVals((old) =>
											old.map((x, i) =>
												i === selected - 1
													? Number(e.target.value)
													: x,
											),
										)
									}
								/>
								<button
									className="secondary"
									onClick={() =>
										setVals((old) =>
											old.map((x, i) =>
												i === selected - 1 ? 0 : x,
											),
										)
									}
								>
									Zero
								</button>
							</section>
						</>
					)}
					{page === "mapping" && (
						<>
							<Heading
								title="Mapping"
								eyebrow="DMX → MIDI ROUTING"
								desc="Assign DMX channels to MIDI messages and destinations."
								action={
									<button
										className="primary"
										onClick={() =>
											setEditing({
												id: 0,
												on: true,
												dmx: selected,
												type: "CC",
												mch: 1,
												num: 7,
												name: "",
												dest: "USB",
												threshold: 20,
											})
										}
									>
										<Plus size={15} /> New mapping
									</button>
								}
							/>
							<div className="mapbar">
								<input placeholder="Search channel, label, MIDI…" />
								<span>
									{active} active · {maps.length} total
								</span>
							</div>
							<section className="panel tablepanel">
								<Table
									maps={maps}
									full
									onEdit={setEditing}
									onToggle={(id: number) =>
										setMaps((old) =>
											old.map((m) =>
												m.id === id
													? { ...m, on: !m.on }
													: m,
											),
										)
									}
									onDelete={(id: number) =>
										setMaps((old) =>
											old.filter((m) => m.id !== id),
										)
									}
								/>
							</section>
							<p className="hint">
								<Sparkles size={14} /> Demo state is temporary.
								Device storage and firmware API will be
								connected later.
							</p>
						</>
					)}
					{page === "connections" && (
						<>
							<Heading
								title="Connections"
								eyebrow="TRANSPORTS & NETWORK"
								desc="Manage MIDI transports and Wi-Fi mode."
							/>
							<div className="connection-grid">
								<Connect
									icon={Cable}
									title="USB MIDI"
									sub="Native USB device"
									state="Enabled"
									note="Connected (simulated)"
								/>
								<Connect
									icon={AudioLines}
									title="BLE MIDI"
									sub="Bluetooth Low Energy"
									state="Planned"
									note="Not implemented yet"
								/>
								<Connect
									icon={Network}
									title="RTP-MIDI"
									sub="MIDI over Wi-Fi"
									state="Planned"
									note="Not implemented yet"
								/>
							</div>
							<section className="panel">
								<PanelHead
									title="Wi-Fi mode"
									subtitle="Select configuration access mode"
								/>
								<div className="wifi-options">
									{["AP", "Station"].map((x) => (
										<button
											className={
												wifi === x ? "chosen" : ""
											}
											onClick={() => setWifi(x)}
											key={x}
										>
											<Wifi />
											<div>
												<b>
													{x === "AP"
														? "Access Point"
														: "Station"}
												</b>
												<small>
													{x === "AP"
														? "Device creates its setup network"
														: "Connect to an existing network"}
												</small>
											</div>
											{wifi === x && <Check />}
										</button>
									))}
								</div>
								{wifi === "Station" && (
									<div className="wifi-form">
										<input placeholder="SSID" />
										<input
											placeholder="Password"
											type="password"
										/>
										<button
											className="primary"
											onClick={() =>
												alert(
													"Preview only: not saved or transmitted.",
												)
											}
										>
											Connect (demo)
										</button>
									</div>
								)}
							</section>
						</>
					)}
					{page === "settings" && (
						<>
							<Heading
								title="Settings"
								eyebrow="DEVICE PREFERENCES"
								desc="Prototype options and system information."
							/>
							<section className="panel settings">
								<PanelHead
									title="DMX behavior"
									subtitle="Input signal handling"
								/>
								<Setting
									label="Signal loss timeout"
									help="How long before input is marked offline"
									right={
										<select defaultValue="1000">
											<option>500 ms</option>
											<option value="1000">
												1000 ms
											</option>
											<option>2000 ms</option>
											<option>5000 ms</option>
										</select>
									}
								/>
								<Setting
									label="On DMX loss"
									help="Release active notes; CC values hold last value"
									right={<span className="tag">Default</span>}
								/>
							</section>
							<section className="panel settings">
								<PanelHead
									title="Prototype"
									subtitle="Local simulation controls"
								/>
								<Setting
									label="Demo data generator"
									help="Simulate changing DMX channels"
									right={<Toggle on={demo} set={setDemo} />}
								/>
								<Setting
									label="Stream animation"
									help="Pause/resume generated values"
									right={
										<Toggle on={stream} set={setStream} />
									}
								/>
								<Setting
									label="Reset demo"
									help="Restore sample mappings and channel values"
									right={
										<button
											className="secondary"
											onClick={() => location.reload()}
										>
											Reset
										</button>
									}
								/>
							</section>
							<section className="panel settings">
								<PanelHead
									title="About"
									subtitle="Build information"
								/>
								<Setting
									label="Product"
									right="DMX MIDI Converter"
								/>
								<Setting label="UI version" right="0.1.0" />
								<Setting
									label="Mode"
									right="Demo · no hardware"
								/>
							</section>
						</>
					)}
				</section>
			</main>
			{editing && (
				<EditModal
					m={editing}
					close={() => setEditing(null)}
					save={save}
				/>
			)}
		</div>
	);
}
function Heading({ title, eyebrow, desc, action }: any) {
	return (
		<div className="heading">
			<div>
				<label>{eyebrow}</label>
				<h1>{title}</h1>
				<p>{desc}</p>
			</div>
			{action}
		</div>
	);
}
function PanelHead({ title, subtitle, link, onClick }: any) {
	return (
		<div className="panelhead">
			<div>
				<h2>{title}</h2>
				<small>{subtitle}</small>
			</div>
			{link && (
				<button className="link" onClick={onClick}>
					{link} →
				</button>
			)}
		</div>
	);
}
function Stat({ icon: Icon, title, value, note }: any) {
	return (
		<article className="stat">
			<div className="stat-icon">
				<Icon />
			</div>
			<small>{title}</small>
			<b>{value}</b>
			<span>{note}</span>
		</article>
	);
}
function Event({ type, text, val }: any) {
	return (
		<div className="event">
			<label className={type.toLowerCase()}>{type}</label>
			<div>
				<b>{text}</b>
				<small>Channel 1 · simulated</small>
			</div>
			<span className="progress">
				<i style={{ width: `${(val / 127) * 100}%` }} />
			</span>
			<strong>{val}</strong>
		</div>
	);
}
function Toggle({ on, set }: any) {
	return (
		<button
			className={"toggle " + (on ? "on" : "")}
			onClick={() => set(!on)}
		>
			<i />
		</button>
	);
}
function Connect({ icon: Icon, title, sub, state, note }: any) {
	return (
		<section className="panel connect">
			<div className="stat-icon">
				<Icon />
			</div>
			<h2>{title}</h2>
			<small>{sub}</small>
			<label className={state === "Enabled" ? "good" : "planned"}>
				{state}
			</label>
			<p>{note}</p>
		</section>
	);
}
function Setting({ label, help, right }: any) {
	return (
		<div className="setting">
			<div>
				<b>{label}</b>
				{help && <small>{help}</small>}
			</div>
			<div>{right}</div>
		</div>
	);
}
function Table({ maps, full, onEdit, onToggle, onDelete }: any) {
	return (
		<table>
			<thead>
				<tr>
					<th>STATE</th>
					<th>DMX</th>
					<th>NAME</th>
					<th>MIDI</th>
					<th>DEST</th>
					{full && (
						<>
							<th>TRIGGER / RANGE</th>
							<th />
						</>
					)}
				</tr>
			</thead>
			<tbody>
				{maps.map((m: M) => (
					<tr key={m.id}>
						<td>
							{full ? (
								<Toggle on={m.on} set={() => onToggle(m.id)} />
							) : (
								<span className={m.on ? "enabled" : "disabled"}>
									●
								</span>
							)}
						</td>
						<td>
							<span className="dmx">
								CH {String(m.dmx).padStart(3, "0")}
							</span>
						</td>
						<td>
							<b>{m.name || "Untitled"}</b>
							<small>
								{m.type === "CC"
									? "Control Change"
									: "Note trigger"}
							</small>
						</td>
						<td>
							<span className={"type " + m.type.toLowerCase()}>
								{m.type}
							</span>{" "}
							<b>
								{m.type === "CC"
									? `CC ${m.num}`
									: `Note ${m.num}`}
							</b>
							<small>Ch {m.mch}</small>
						</td>
						<td>
							<span className="dest">{m.dest}</span>
						</td>
						{full && (
							<>
								<td>
									<small>
										{m.type === "CC"
											? "0–127 scale"
											: `Threshold ${m.threshold}`}
									</small>
								</td>
								<td>
									<button
										className="rowbtn"
										onClick={() => onEdit(m)}
									>
										<Edit3 size={14} />
									</button>
									<button
										className="rowbtn"
										onClick={() => onDelete(m.id)}
									>
										<Trash2 size={14} />
									</button>
								</td>
							</>
						)}
					</tr>
				))}
			</tbody>
		</table>
	);
}
function EditModal({ m, close, save }: any) {
	const [d, setD] = useState<M>(m);
	const upd = (k: keyof M, v: any) => setD((x) => ({ ...x, [k]: v }));
	return (
		<div className="overlay" onClick={close}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<div className="modalhead">
					<div>
						<h2>Mapping editor</h2>
						<small>Configure a DMX-to-MIDI assignment</small>
					</div>
					<button className="rowbtn" onClick={close}>
						<X />
					</button>
				</div>
				<div className="form">
					<label>
						DMX channel
						<input
							type="number"
							min="1"
							max="512"
							value={d.dmx}
							onChange={(e) => upd("dmx", +e.target.value)}
						/>
					</label>
					<label>
						Type
						<select
							value={d.type}
							onChange={(e) => upd("type", e.target.value)}
						>
							<option>CC</option>
							<option>NOTE</option>
						</select>
					</label>
					<label>
						Label
						<input
							value={d.name}
							placeholder="e.g. QLab cue"
							onChange={(e) => upd("name", e.target.value)}
						/>
					</label>
					<label>
						MIDI channel
						<select
							value={d.mch}
							onChange={(e) => upd("mch", +e.target.value)}
						>
							{Array.from({ length: 16 }, (_, i) => (
								<option key={i} value={i + 1}>
									{i + 1}
								</option>
							))}
						</select>
					</label>
					<label>
						{d.type === "CC" ? "CC number" : "Note number"}
						<input
							type="number"
							min="0"
							max="127"
							value={d.num}
							onChange={(e) => upd("num", +e.target.value)}
						/>
					</label>
					<label>
						Destination
						<select
							value={d.dest}
							onChange={(e) => upd("dest", e.target.value)}
						>
							<option>USB</option>
							<option>USB + BLE</option>
							<option>RTP-MIDI</option>
						</select>
					</label>
					{d.type === "NOTE" && (
						<label>
							Trigger threshold
							<input
								type="number"
								min="0"
								max="255"
								value={d.threshold}
								onChange={(e) =>
									upd("threshold", +e.target.value)
								}
							/>
						</label>
					)}
				</div>
				<div className="modalfoot">
					<button className="secondary" onClick={close}>
						Cancel
					</button>
					<button className="primary" onClick={() => save(d)}>
						<Check size={15} /> Save mapping
					</button>
				</div>
			</div>
		</div>
	);
}

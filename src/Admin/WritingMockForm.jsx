import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function WritingMockForm() {
    const { id } = useParams();
    const [scenario, setScenario] = useState("");
    const [task11, setTask11] = useState("");
    const [task12, setTask12] = useState("");
    const [task2, setTask2] = useState("");
    const [images, setImages] = useState([]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const urls = files.map(f => URL.createObjectURL(f));
        setImages(urls);
    };

    const submit = () => {
        const body = {
            images: images,
            task1: {
                scenario,
                task11,
                task12,
            },
            task2: {
                task2,
            }
        };

        console.log("CREATED MOCK:", body);
        alert("Mock saved (fake)");
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create / Edit Writing Mock</h1>

            {/* Part 1 Scenario */}
            <div className="mb-4">
                <label className="font-semibold">Part 1 Scenario:</label>
                <textarea
                    className="w-full border p-2 rounded"
                    rows="4"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Enter scenario text..."
                />
            </div>

            {/* Task 1.1 */}
            <div className="mb-4">
                <label className="font-semibold">Task 1.1 Prompt:</label>
                <textarea
                    className="w-full border p-2 rounded"
                    rows="4"
                    value={task11}
                    onChange={(e) => setTask11(e.target.value)}
                    placeholder="Enter Task 1.1 prompt..."
                />
            </div>

            {/* Task 1.2 */}
            <div className="mb-4">
                <label className="font-semibold">Task 1.2 Prompt:</label>
                <textarea
                    className="w-full border p-2 rounded"
                    rows="4"
                    value={task12}
                    onChange={(e) => setTask12(e.target.value)}
                    placeholder="Enter Task 1.2 prompt..."
                />
            </div>

            {/* Part 2 */}
            <div className="mb-4">
                <label className="font-semibold">Part 2 – Task 2 Prompt:</label>
                <textarea
                    className="w-full border p-2 rounded"
                    rows="4"
                    value={task2}
                    onChange={(e) => setTask2(e.target.value)}
                    placeholder="Enter Part 2 task prompt..."
                />
            </div>

            {/* Images */}
            {/* <div className="mb-4">
        <label className="font-semibold">Images (optional):</label>
        <input type="file" multiple onChange={handleImageUpload} className="block mt-2" />

        <div className="mt-3 flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <img key={i} src={img} className="w-24 h-24 object-cover border rounded" />
          ))}
        </div>
      </div> */}

            <button
                onClick={submit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Save Mock
            </button>
        </div>
    );
}

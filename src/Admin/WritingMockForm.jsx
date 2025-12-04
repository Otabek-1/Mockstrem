import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../api";

export default function WritingMockForm() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const edit = searchParams.get("edit") === "true";
    const mockId = searchParams.get("id");

    const [scenario, setScenario] = useState("");
    const [task11, setTask11] = useState("");
    const [task12, setTask12] = useState("");
    const [task2, setTask2] = useState("");
    const [images, setImages] = useState([]);

    // load existing mock if edit mode
    useEffect(() => {
        if (edit && mockId) {
            api.get(`/mock/writing/mock/${mockId}`)
                .then(res => {
                    const data = res.data;

                    setScenario(data.task1.scenario);
                    setTask11(data.task1.task11);
                    setTask12(data.task1.task12);
                    setTask2(data.task2.task2);
                    setImages(data.images || []);
                })
                .catch(err => {
                    console.log(err);
                    alert("Error loading mock data");
                });
        }
    }, [edit, mockId]);

    const submit = () => {
        const body = {
            images,
            task1: { scenario, task11, task12 },
            task2: { task2 },
        };

        if (edit && mockId) {
            api.put(`/mock/writing/update/${mockId}`, body)
                .then(() => alert("Mock updated successfully"))
                .catch(err => {
                    console.log(err);
                    alert("Error updating mock");
                });
        } else {
            api.post("/mock/writing/create", body)
                .then(() => alert("Mock created successfully"))
                .catch(err => {
                    console.log(err);
                    alert("Error creating mock");
                });
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                {edit ? "Edit Writing Mock" : "Create Writing Mock"}
            </h1>

            <div className="mb-4">
                <label className="font-semibold">Part 1 Scenario:</label>
                <textarea
                    className="w-full border p-2 rounded"
                    rows="4"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="font-semibold">Task 1.1 Prompt:</label>
                <textarea
                    className="w-full border p-2 rounded"
                    rows="4"
                    value={task11}
                    onChange={(e) => setTask11(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="font-semibold">Task 1.2 Prompt:</label>
                <textarea
                    className="w-full border p-2 rounded"
                    rows="4"
                    value={task12}
                    onChange={(e) => setTask12(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="font-semibold">Part 2 – Task 2 Prompt:</label>
                <textarea
                    className="w-full border p-2 rounded"
                    rows="4"
                    value={task2}
                    onChange={(e) => setTask2(e.target.value)}
                />
            </div>

            <button
                onClick={submit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {edit ? "Update Mock" : "Save Mock"}
            </button>
        </div>
    );
}

import React from "react";

export function Info() {
    return (
        <div>
            <h2>What Diff Fuse does</h2>
            <p>
                Diff Fuse compares multiple JSON documents side by side and helps you build one merged
                result by choosing which values should be kept in the final output.
            </p>

            <h2>How to use it</h2>

            <h3>1. Add your JSON documents</h3>
            <p>
                Paste or type one or more valid JSON documents in the <strong>Raw JSONs</strong> input area. Give them clear names
                so it is easier to see which document each value comes from.
            </p>

            <h3>2. Add documents to session</h3>
            <p>
                Once the documents are loaded, <strong>Diff Fuse</strong> panel computes a structural comparison and shows the
                result as a tree.
            </p>

            <h3>3. Choose what you want to see</h3>
            <p>
                You can switch between two visibility modes:
            </p>
            <ul>
                <li>
                    <strong>Show all</strong>: show the full tree, including paths where all documents agree
                </li>
                <li>
                    <strong>Show diff</strong>: show only paths that are not the same (default)
                </li>
            </ul>
            <p>
                The <strong>Show diff</strong> view is usually the fastest way to focus on what actually
                needs attention.
            </p>

            <h3>4. Read the comparison tree</h3>
            <p>
                Each row represents one JSON path. For each row, Diff Fuse can show:
            </p>
            <ul>
                <li>the path name</li>
                <li>the values from each document</li>
                <li>the current merged value</li>
                <li>a label describing the difference, when the documents do not agree</li>
            </ul>
            <p>
                Paths where all documents agree show no label, because there is nothing to resolve
                there. Every label you do see starts with <strong>diff</strong>, because they are all
                kinds of difference — the part after the colon says which kind.
            </p>

            <h3>5. Resolve differences</h3>
            <p>
                When documents differ, select the value you want to keep from one of the source
                documents. The merged result updates immediately.
            </p>
            <p>
                Selections also <strong>propagate down the tree</strong>. That means choosing a value at
                a higher-level node affects its children as well, unless you override a child node more
                specifically.
            </p>

            <h3>6. Adjust array matching when needed</h3>
            <p>
                Arrays can be compared in different ways. Use the array strategy control on array nodes
                to choose how elements should be aligned across documents.
            </p>
            <ul>
                <li>
                    <strong>index</strong>: align items by position, so element 0 is compared with
                    element 0, element 1 with element 1, and so on
                </li>
                <li>
                    <strong>keyed</strong>: align object items using a field such as <code>id</code> or{" "}
                    <code>name</code>
                </li>
                <li>
                    <strong>value</strong>: align scalar array entries by their value
                </li>
            </ul>
            <p>
                Use <strong>keyed</strong> when array items are objects that may appear in different
                orders. Use <strong>value</strong> when the array contains scalars such as strings or
                numbers and order is less important than content.
            </p>

            <h3>7. Preview the merged result</h3>
            <p>
                Use the preview button to inspect the final merged JSON before exporting it.
            </p>

            <h3>8. Export</h3>
            <p>You can then:</p>
            <ul>
                <li>
                    <strong>Preview</strong> the merged JSON in a popup
                </li>
                <li>
                    <strong>Copy</strong> the merged JSON to the clipboard
                </li>
                <li>
                    <strong>Download</strong> the merged JSON as a file
                </li>
            </ul>

            <h2>Kinds of difference</h2>
            <p>
                All three labels mark a difference. What separates them is <em>why</em> the documents
                differ, and whether Diff Fuse can settle it without you.
            </p>
            <ul>
                <li>
                    <strong>diff</strong>: the documents hold different values of the same type, for
                    example <code>"MIT"</code> against <code>"Apache-2.0"</code>. Only you can say which
                    one is right, so pick a document.
                </li>
                <li>
                    <strong>diff: missing</strong>: only some documents have a value here — the rest
                    either omit the field or set it to <code>null</code>. There is just one real value,
                    so it is chosen automatically. You can still override it.
                </li>
                <li>
                    <strong>diff: incompatible</strong>: the documents disagree on shape, for example an
                    object against a string. There is no sensible way to compare them piece by piece, so
                    the whole value is offered from each document and you pick one.
                </li>
                <li>
                    <strong>no label</strong>: every document agrees, so there is nothing to resolve.
                </li>
            </ul>
            <p>
                A parent row is labelled <strong>diff: incompatible</strong> whenever something nested
                inside it is. Resolve the row that actually carries the conflict and the parent clears
                too — the Diagnostics panel lists exactly which rows those are.
            </p>

            <h2>Recommended workflow</h2>
            <ul>
                <li>Start in <strong>Show diff</strong> mode to focus on paths that need decisions</li>
                <li>Resolve higher-level differences first when possible</li>
                <li>Adjust array matching if array rows look misaligned</li>
                <li>Preview the merged JSON before copying or downloading it</li>
            </ul>
        </div>
    );
}
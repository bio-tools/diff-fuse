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
                <li>a comparison status when the path is not the same</li>
            </ul>
            <p>
                Paths that are <strong>same</strong> do not show a status label, because there is no
                conflict to resolve there.
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

            <h2>Comparison states</h2>
            <ul>
                <li>
                    <strong>diff</strong>: documents contain different values at this path
                </li>
                <li>
                    <strong>missing</strong>: the path is absent in one or more documents
                </li>
                <li>
                    <strong>type_error</strong>: values at this path have incompatible structures or
                    types, so they cannot be compared meaningfully
                </li>
                <li>
                    <strong>[null]</strong>: all documents agree, so no status label is shown
                </li>
            </ul>

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
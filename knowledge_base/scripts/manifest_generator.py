import os
import pandas as pd

records = []

for root, dirs, files in os.walk(
    "../data"
):

    for file in files:
        path = os.path.join(
            root,
            file
        )

        records.append({

            "filename": file,
            "category":
            os.path.basename(root),

            "size_mb":
            round(
                os.path.getsize(path)
                / (1024 * 1024),
                2
            )
        })

df = pd.DataFrame(records)

df.to_csv(
    "../metadata/manifest.csv",
    index=False
)

print(
    "manifest.csv generated"
)
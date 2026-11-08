# Material Register

A searchable catalogue of the materials (spare parts, consumables, raw materials and tools) that industrial and maintenance teams stock, often synced from SAP.

## Language

**Material**:
A single catalogue record identified by its Material Number, held at exactly one Plant.
_Avoid_: Part, item, SKU, product

**Material Number**:
The unique identifier of a Material, formatted like `MAT-000123`.
_Avoid_: Part number, ID, code

**Material Type**:
The fixed category of a Material: Spare Part, Consumable, Raw Material or Tool.
_Avoid_: Category, kind, class

**Status**:
The lifecycle state of a Material: Active, Obsolete or Pending Review.
_Avoid_: State, lifecycle

**Plant**:
A physical site that holds stock, identified by a code and a name (such as `1000 · Brisbane`).
_Avoid_: Site, location, warehouse, depot

**Plant Code**:
The short code that uniquely identifies a Plant, as used in SAP (such as `1000`). It may contain letters or leading zeros.
_Avoid_: Plant ID, plant number, site code

**Manufacturer**:
The company that makes a Material (such as SKF).
_Avoid_: Vendor, supplier, brand, OEM

**Manufacturer Part Number (MPN)**:
The Manufacturer's own identifier for the Material, distinct from the Material Number.
_Avoid_: Part number, vendor code

**Quantity on Hand**:
The stock of a Material currently held at its Plant, counted in its Unit of Measure.
_Avoid_: Stock level, inventory, qty

**Unit of Measure (UoM)**:
The unit that Quantity on Hand and Unit Price are expressed in, such as EA.
_Avoid_: Unit, measure

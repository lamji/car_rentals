# Atomic History - Admin Garage Address Autocomplete

**Date**: 2026-02-18
**Context**: Admin needed a way to easily input garage addresses for cars using Mapbox autocomplete instead of manual typing.

## Changes
1. **MapboxAutocomplete Component**: Created a new reusable `MapboxAutocomplete` component in `src/components/ui/mapbox-autocomplete.tsx` that:
    - Debounces user input.
    - Fetches suggestions from Mapbox Geocoding API.
    - Returns both the formatted address and geographical coordinates.
    - Specifically filters for Philippine locations (`country=PH`).
2. **CarFormModal Integration**: Updated `src/components/admin/cars/CarFormModal.tsx` to:
    - Use `MapboxAutocomplete` for the "Garage Address" field.
    - Synchronize both `garageLocation.address` and `garageAddress` fields upon selection.
    - Automatically populate `garageLocation.coordinates` when a suggestion is selected.
3. **Integrated Map Search**: Added a dedicated search box within the `GarageMapPicker` component. This allows users to:
    - Search for an address via autocomplete directly on the map.
    - View suggestions and select one to instantly center the map and drop the marker.
    - Continue to pinpoint the exact location by dragging the marker or clicking the map.
    - Synchronize all geocoded details (city, province, address) back to the form state.

## Verification
- Open Car Management in Admin.
- Create or Edit a car.
- Go to "Garage Location" tab.
- Type in the "Garage Address" field.
- Verify suggestions appear.
- Verify selecting a suggestion populates the field and updates coordinates in the payload.

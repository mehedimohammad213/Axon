import React, { useEffect, useState } from "react";
import { Select } from "antd";
import instance from "../../axios";

const ProductLocationField = ({
  value,
  onChange,
  divisionLabel = "Select Division",
  districtLabel = "Select District",
}) => {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const division = value?.division ?? null;
  const district = value?.district ?? null;

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await instance.get("/location/divisions");
        if (response.status === 200) {
          setDivisions(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching divisions:", error);
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (!division) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      try {
        const response = await instance.get(`/location/districts/${division}`);
        if (response.status === 200) {
          setDistricts(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, [division]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select
        allowClear
        className="w-full sm:w-1/2"
        placeholder={divisionLabel}
        value={division}
        options={divisions.map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        onChange={(nextDivision) => {
          onChange?.({
            division: nextDivision ?? null,
            district: null,
          });
        }}
      />
      <Select
        allowClear
        className="w-full sm:w-1/2"
        placeholder={districtLabel}
        value={district}
        options={districts.map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        onChange={(nextDistrict) => {
          onChange?.({
            division,
            district: nextDistrict ?? null,
          });
        }}
      />
    </div>
  );
};

export default ProductLocationField;

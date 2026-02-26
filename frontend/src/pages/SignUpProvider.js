import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, ErrorText, Hint, Input, Label } from "../components/ui";
import { signUpProvider } from "../lib/authApi";
import { saveSession } from "../lib/session";
import MultiSelect from "./MultiSelect";
import StrengthPassword from "./PassWord";
import Select from "react-select";

const TUNISIAN_GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
  "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Sousse",
  "Monastir", "Mahdia", "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid",
  "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili",
];

export default function SignUpProvider() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    password: "",
    category: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    let message = "";
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    switch (field) {
      case "name":
        if (!trimmedValue) {
          message = "Full name is required.";
        } else if (trimmedValue.length < 3) {
          message = "Full name must be at least 3 characters.";
        } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedValue)) {
          message = "Full name contains invalid characters.";
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedValue) {
          message = "Email is required.";
        } else if (!emailRegex.test(trimmedValue)) {
          message = "Please enter a valid email address.";
        }
        break;

      case "city":
        if (!trimmedValue) {
          message = "City is required.";
        } else if (trimmedValue.length < 2) {
          message = "City name is too short.";
        }
        break;

      case "password":
        if (!value) {
          message = "Password is required.";
        } else if (value.length < 8) {
          message = "Password must be at least 8 characters.";
        } else if (!/[A-Z]/.test(value)) {
          message = "Password must include at least one uppercase letter.";
        } else if (!/[a-z]/.test(value)) {
          message = "Password must include at least one lowercase letter.";
        } else if (!/[0-9]/.test(value)) {
          message = "Password must include at least one number.";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          message = "Password must include at least one special character.";
        }
        break;

      case "category":
        if (!value || value.length === 0) {
          message = "Please select at least one category.";
        }
        break;

      default:
        break;
    }
    return message;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const message = validateField(field, formData[field]);
      if (message) newErrors[field] = message;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    const message = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  async function onSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = { ...formData, serviceCategory: formData.category.join(", ") };
      const session = await signUpProvider(payload);
      saveSession(session);
      navigate("/provider", { replace: true });

    } catch (err) {
      // apiClient handles toast.error automatically.
    } finally {
      setLoading(false);
    }
  }


  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Create a provider account</h2>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
          Provider
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <div className="flex items-center gap-1">
            <Label htmlFor="name">Full name</Label>
            <span className="text-red-500 font-bold">*</span>
          </div>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={errors.name ? "border-red-500" : ""}
          />

          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}

        </div>

        <div>
          <div className="flex items-center gap-1">
            <Label htmlFor="email">Email</Label>
            <span className="text-red-500 font-bold">*</span>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={errors.email ? "border-red-500" : ""}
          />

          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}

        </div>

        <div>
          <MultiSelect
            label="Service category"
            required
            options={["Plumbing", "Cleaning", "Electrician", "Carpentry", "Moving", "Painting"]}
            selectedValues={formData.category}
            onChange={(values) => handleChange("category", values)}
            onBlur={() => handleBlur("category")}
          />

          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category}</p>
          )}
          <Hint>You can add more categories later in onboarding.</Hint>
        </div>

        <div>
          <div className="flex items-center gap-1">
            <Label htmlFor="city">City</Label>
            <span className="text-red-500 font-bold">*</span>
          </div>

          <Select
            inputId="city"
            options={TUNISIAN_GOVERNORATES.map((gov) => ({
              value: gov,
              label: gov,
            }))}
            value={
              formData.city
                ? { value: formData.city, label: formData.city }
                : null
            }
            onChange={(selected) => {
              handleChange("city", selected ? selected.value : "");
            }}
            onBlur={() => handleBlur("city")}
            placeholder="Select a governorate"
            className="mt-2"
            classNames={{
              control: ({ isFocused }) =>
                `rounded-lg border bg-white px-2 py-1 shadow-sm transition-all ${isFocused
                  ? "border-black ring-2 ring-black/20"
                  : "border-gray-300"
                }`,
              menu: () =>
                "mt-2 rounded-lg border border-gray-200 shadow-lg",
              option: ({ isFocused, isSelected }) =>
                `px-4 py-2 cursor-pointer ${isSelected
                  ? "bg-black text-white"
                  : isFocused
                    ? "bg-gray-100"
                    : "bg-white"
                }`,
              placeholder: () => "text-gray-400",
              singleValue: () => "text-gray-800",
            }}
          />

          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}

          <Hint>This helps us match nearby providers.</Hint>
        </div>
        <StrengthPassword
          password={formData.password}
          setPassword={(value) => handleChange("password", value)}
          error={errors.password}
          onBlur={() => handleBlur("password")}
        />

        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password}</p>
        )}
        <Button loading={loading} disabled={loading}>
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link className="font-semibold text-zinc-900 hover:underline" to="/sign-in">
          Sign in
        </Link>
      </div>

      <div className="mt-3 text-center text-sm text-zinc-600">
        Need a service instead?{" "}
        <Link className="font-semibold text-zinc-900 hover:underline" to="/sign-up/client">
          Create client account
        </Link>
      </div>
    </Card>
  );
}

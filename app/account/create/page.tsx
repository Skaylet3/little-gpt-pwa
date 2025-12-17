"use client";

import { useState } from "react";
import { Bot, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Header } from "@/app/page";
import { PageFooter } from "@/app/auth/page";

// =============================================================================
// TYPES
// =============================================================================

interface GoogleUser {
  name: string;
  email: string;
  image?: string;
}

// =============================================================================
// MOCK DATA (replace with actual Google OAuth data)
// =============================================================================

const MOCK_USER: GoogleUser = {
  name: "Olivia Rhye",
  email: "olivia@untitledui.com",
  image: undefined, // Will show initial letter fallback
};

// =============================================================================
// CREATE ACCOUNT WELCOME SECTION
// =============================================================================

function CreateAccountWelcomeSection() {
  return (
    <section className="flex flex-col items-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-blue-50">
        <Bot className="size-8 text-blue-600" strokeWidth={1.5} />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Create Your Account
      </h2>
      <p className="text-sm font-medium text-gray-500">
        Final step to start your session.
      </p>
    </section>
  );
}

// =============================================================================
// USER PROFILE CARD
// =============================================================================

interface UserProfileCardProps {
  user: GoogleUser;
  onChangeAccount?: () => void;
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  // Generate consistent color based on name
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function UserProfileCard({ user, onChangeAccount }: UserProfileCardProps) {
  return (
    <button
      type="button"
      onClick={onChangeAccount}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl p-4",
        "bg-gray-50 border-[1.5px] border-gray-200",
        "transition-colors hover:bg-gray-100",
        "text-left"
      )}
    >
      {/* Avatar */}
      {user.image ? (
        <img
          src={user.image}
          alt={user.name}
          className="size-12 rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            "text-lg font-semibold text-white",
            getAvatarColor(user.name)
          )}
        >
          {getInitial(user.name)}
        </div>
      )}

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-gray-900 truncate">
          {user.name}
        </p>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>

      {/* Change Account Icon */}
      <ChevronDown className="size-5 text-gray-400 shrink-0" />
    </button>
  );
}

// =============================================================================
// TERMS CHECKBOX
// =============================================================================

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function TermsCheckbox({ checked, onChange }: TermsCheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="size-[14px] rounded-full border-[1.5px] border-blue-600 data-[state=checked]:bg-blue-600"
      />
      <span className="text-sm font-medium text-gray-600">
        I agree to the{" "}
        <a href="/terms" className="text-blue-600 hover:underline">
          Terms
        </a>{" "}
        &{" "}
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy
        </a>
      </span>
    </label>
  );
}

// =============================================================================
// CREATE ACCOUNT PAGE
// =============================================================================

export default function CreateAccountPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // TODO: Replace with actual user data from Google OAuth
  const user = MOCK_USER;

  const handleChangeAccount = () => {
    console.log("Change account clicked");
    // TODO: Trigger Google OAuth with prompt: "select_account"
  };

  const handleCreateAccount = () => {
    if (!agreedToTerms) return;
    console.log("Create account clicked");
    // TODO: Create user in database and redirect to main app
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Header */}
      <Header title="Little GPT" className="w-full" />

      {/* Main Content */}
      <main className="flex flex-1 flex-col justify-center items-center gap-[36px] px-[24px]">
        <CreateAccountWelcomeSection />

        {/* User Profile & Actions */}
        <div className="flex w-full flex-col gap-6">
          <UserProfileCard user={user} onChangeAccount={handleChangeAccount} />

          <TermsCheckbox
            checked={agreedToTerms}
            onChange={setAgreedToTerms}
          />

          <Button
            type="button"
            onClick={handleCreateAccount}
            disabled={!agreedToTerms}
            className={cn(
              "w-full py-[16px] rounded-full",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "text-lg font-semibold",
              "transition-colors",
              "disabled:bg-blue-300 disabled:cursor-not-allowed"
            )}
          >
            Create Account
          </Button>
        </div>
      </main>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}

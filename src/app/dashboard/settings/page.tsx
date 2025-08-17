"use client";

import { useState, useEffect } from "react";
import { settingsAPI } from "@/lib/api";
import { SystemSettings } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [businessHoursStart, setBusinessHoursStart] = useState("");
  const [businessHoursEnd, setBusinessHoursEnd] = useState("");
  const [businessDays, setBusinessDays] = useState<string[]>([]);
  const [baseRate, setBaseRate] = useState(0);
  const [currency, setCurrency] = useState("GBP");

  // Pricing settings
  const [congestionCharge, setCongestionCharge] = useState(0);
  const [dartfordCrossing, setDartfordCrossing] = useState(0);

  // Service area settings
  const [maxDistance, setMaxDistance] = useState(0);
  const [excludedAreas, setExcludedAreas] = useState<string[]>([]);
  const [includedIslands, setIncludedIslands] = useState<string[]>([]);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await settingsAPI.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);

        // Update form states
        setCompanyName(response.data.companyName || "");
        setContactEmail(response.data.contactEmail || "");
        setContactPhone(response.data.contactPhone || "");
        setBusinessHoursStart(response.data.businessHours?.weekdays?.start || "");
        setBusinessHoursEnd(response.data.businessHours?.weekdays?.end || "");
        setBusinessDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]); // Default weekdays

        // Pricing settings
        setBaseRate(response.data.pricing?.baseRate || 0);
        setCurrency(response.data.pricing?.currency || "GBP");
        setCongestionCharge(
          response.data.pricing?.extraFees?.congestionCharge || 0
        );
        setDartfordCrossing(
          response.data.pricing?.extraFees?.dartfordCrossing || 0
        );

        // Service area settings
        if (response.data.serviceAreas) {
          setMaxDistance(response.data.serviceAreas.maxDistance || 350);
          setExcludedAreas(response.data.serviceAreas.excludedAreas || []);
          setIncludedIslands(response.data.serviceAreas.includedIslands || []);
        }

        // Notification settings
        setEmailNotifications(response.data.notifications?.emailEnabled || false);
        setSmsNotifications(response.data.notifications?.smsEnabled || false);
        setPushNotifications(response.data.notifications?.pushNotifications || false);
      } else {
        setError(response.error?.message || "Failed to load settings");
      }
    } catch (err) {
      setError("An error occurred while fetching settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const updatedSettings: Partial<SystemSettings> = {
      companyName,
      contactEmail,
      contactPhone,
      businessHours: {
        timezone: "Europe/London", // Default timezone
        weekdays: {
          start: businessHoursStart,
          end: businessHoursEnd,
        },
        weekends: {
          start: businessHoursStart, // Assuming weekends use the same start/end as weekdays for now
          end: businessHoursEnd,
        },
      },
      pricing: {
        congestionCharge,
        dartfordCrossing,
        airportFees: {
          heathrow: 10.0,
          gatwick: 8.0,
          stansted: 8.0,
          luton: 8.0,
          city: 8.0,
        },
        baseRate,
        currency,
        extraFees: {
          congestionCharge,
          dartfordCrossing,
        },
      },
      serviceAreas: {
        maxDistance,
        excludedAreas,
        includedIslands,
      },
      notifications: {
        emailEnabled: emailNotifications,
        smsEnabled: smsNotifications,
        pushNotifications,
        bookingConfirmations: true,
        statusUpdates: true,
      },
    };

    try {
      const response = await settingsAPI.updateSettings(updatedSettings);
      if (response.success) {
        setSuccessMessage("Settings updated successfully");
        fetchSettings(); // Refresh settings
      } else {
        setError(response.error?.message || "Failed to update settings");
      }
    } catch (err) {
      setError("An error occurred while updating settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessDayToggle = (day: string) => {
    if (businessDays.includes(day)) {
      setBusinessDays(businessDays.filter((d) => d !== day));
    } else {
      setBusinessDays([...businessDays, day]);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 w-full max-w-3xl text-red-300">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
        <Button onClick={fetchSettings} variant="default">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">
            Configure system settings and preferences
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-900/30 border border-green-500 p-4 mb-6 text-green-300 rounded-lg animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-500 p-4 mb-6 text-red-300 rounded-lg animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-700 p-1 rounded-lg">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:text-purple-300 transition-colors rounded-md"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:text-purple-300 transition-colors rounded-md"
          >
            Pricing
          </TabsTrigger>
          <TabsTrigger
            value="serviceAreas"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:text-purple-300 transition-colors rounded-md"
          >
            Service Areas
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white hover:text-purple-300 transition-colors rounded-md"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="businessHoursStart"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="businessHoursStart"
                      value={businessHoursStart}
                      onChange={(e) => setBusinessHoursStart(e.target.value)}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="businessHoursEnd"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      End Time
                    </label>
                    <input
                      type="time"
                      id="businessHoursEnd"
                      value={businessHoursEnd}
                      onChange={(e) => setBusinessHoursEnd(e.target.value)}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Days
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleBusinessDayToggle(day)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                          businessDays.includes(day)
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Pricing Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="baseRate"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Base Rate
                    </label>
                    <input
                      type="number"
                      id="baseRate"
                      value={baseRate}
                      onChange={(e) => setBaseRate(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">
                    Extra Fees
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="congestionCharge"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Congestion Charge
                      </label>
                      <input
                        type="number"
                        id="congestionCharge"
                        value={congestionCharge}
                        onChange={(e) =>
                          setCongestionCharge(Number(e.target.value))
                        }
                        min="0"
                        step="0.01"
                        className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dartfordCrossing"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Dartford Crossing
                      </label>
                      <input
                        type="number"
                        id="dartfordCrossing"
                        value={dartfordCrossing}
                        onChange={(e) =>
                          setDartfordCrossing(Number(e.target.value))
                        }
                        min="0"
                        step="0.01"
                        className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="serviceAreas" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Service Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="maxDistance"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Maximum Service Distance (miles)
                  </label>
                  <input
                    type="number"
                    id="maxDistance"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="excludedAreas"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Excluded Areas (comma separated)
                  </label>
                  <textarea
                    id="excludedAreas"
                    value={excludedAreas.join(", ")}
                    onChange={(e) =>
                      setExcludedAreas(
                        e.target.value.split(",").map((area) => area.trim())
                      )
                    }
                    rows={3}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="includedIslands"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Included Islands (comma separated)
                  </label>
                  <textarea
                    id="includedIslands"
                    value={includedIslands.join(", ")}
                    onChange={(e) =>
                      setIncludedIslands(
                        e.target.value.split(",").map((island) => island.trim())
                      )
                    }
                    rows={3}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-500 transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800"
                  />
                  <label
                    htmlFor="emailNotifications"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Enable Email Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800"
                  />
                  <label
                    htmlFor="smsNotifications"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Enable SMS Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800"
                  />
                  <label
                    htmlFor="pushNotifications"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Enable Push Notifications
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={saving}
          variant="default"
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:hover:bg-purple-600"
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-700 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}

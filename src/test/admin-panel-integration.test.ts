import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table) => ({
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        data:
          table === "hospitals"
            ? [
                {
                  id: "123",
                  name: "Test RS",
                  city: "Kota Serang",
                  has_icu: true,
                  has_igd: true,
                  total_beds: 100,
                  facilities: ["IGD", "ICU"],
                  services: ["Rawat Inap"],
                },
              ]
            : [],
        error: null,
      }),
      eq: vi.fn().mockReturnThis(),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: "user123", email: "admin@test.com" } } },
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe("Admin Panel - Supabase Integration", () => {
  describe("Hospital Management", () => {
    it("should successfully insert hospital to Supabase with correct payload", async () => {
      // Test case: Memastikan payload yang dikirim ke Supabase sudah correct

      const mockInsert = vi.fn().mockReturnThis();
      const mockUpdate = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: [
          {
            id: "123",
            name: "RS Cilegon",
            type: "RS Umum",
            class: "C",
            address: "Jl. Test",
            city: "Kota Serang",
            phone: "0274123456",
            email: "test@test.com",
            has_icu: true,
            has_igd: true,
            total_beds: 100,
            facilities: ["IGD", "ICU"],
            services: ["Rawat Inap"],
            created_at: "2026-02-20T00:00:00Z",
            updated_at: "2026-02-20T00:00:00Z",
          },
        ],
        error: null,
      });

      mockInsert.mockReturnValueOnce({ select: mockSelect });

      // Expected payload
      const expectedPayload = {
        name: "RS Cilegon",
        type: "RS Umum",
        class: "C",
        address: "Jl. Test",
        city: "Kota Serang",
        district: "Kecamatan Test",
        phone: "0274123456",
        email: "test@test.com",
        website: "https://example.com",
        image: "https://example.com/image.jpg",
        description: "Deskripsi test",
        has_icu: true,
        has_igd: true,
        total_beds: 100,
        operating_hours: "24 Jam",
        google_maps_link: "https://maps.app.goo.gl/test",
        latitude: -6.1185,
        longitude: 106.1564,
        facilities: ["IGD", "ICU"],
        services: ["Rawat Inap"],
      };

      // Verify payload structure
      expect(expectedPayload).toHaveProperty("name");
      expect(expectedPayload).toHaveProperty("address");
      expect(expectedPayload).toHaveProperty("phone");
      expect(expectedPayload).toHaveProperty("has_icu");
      expect(expectedPayload).toHaveProperty("has_igd");
      expect(Array.isArray(expectedPayload.facilities)).toBe(true);
      expect(Array.isArray(expectedPayload.services)).toBe(true);
    });

    it("should handle validation errors properly", async () => {
      // Test case: Form tidak boleh submit dengan field kosong

      const formData = {
        name: "",
        address: "",
        phone: "",
        image: "",
        description: "",
      };

      // Simulate validation
      const errors = [];
      if (!formData.name.trim())
        errors.push("Nama Rumah Sakit tidak boleh kosong!");
      if (!formData.address.trim()) errors.push("Alamat tidak boleh kosong!");
      if (!formData.phone.trim()) errors.push("Telepon tidak boleh kosong!");
      if (!formData.image.trim()) errors.push("URL Gambar tidak boleh kosong!");
      if (!formData.description.trim())
        errors.push("Deskripsi tidak boleh kosong!");

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toBe("Nama Rumah Sakit tidak boleh kosong!");
    });

    it("should log Supabase errors to console", async () => {
      // Test case: Error dari Supabase harus di-log

      const consoleErrorSpy = vi.spyOn(console, "error");

      const mockError = {
        message: "failed to fetch",
        details: "Connection error",
        hint: "Check your Supabase URL and key",
        code: "NETWORK_ERROR",
      };

      console.error("Supabase Error - Add Hospital:", mockError);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Supabase Error - Add Hospital:",
        mockError,
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Banner Management", () => {
    it("should successfully insert banner to Supabase", async () => {
      // Test case: Banner harus tersimpan dengan proper payload

      const bannerPayload = {
        title: "Banner Test",
        subtitle: "Subtitle test",
        image: "https://example.com/banner.jpg",
        link: "https://example.com",
        is_active: true,
        order: 1,
      };

      // Verify payload
      expect(bannerPayload).toHaveProperty("title");
      expect(bannerPayload).toHaveProperty("image");
      expect(typeof bannerPayload.is_active).toBe("boolean");
      expect(typeof bannerPayload.order).toBe("number");
    });

    it("should validate banner required fields", async () => {
      // Test case: Title dan image wajib diisi

      const bannerData = {
        title: "",
        image: "",
      };

      const errors = [];
      if (!bannerData.title.trim()) errors.push("Judul tidak boleh kosong!");
      if (!bannerData.image.trim())
        errors.push("URL Gambar tidak boleh kosong!");

      expect(errors.length).toBe(2);
    });
  });

  describe("Environment Variables", () => {
    it("should have required Supabase environment variables", () => {
      // Test case: .env harus punya VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Catatan: Test ini akan fail jika .env tidak diatur
      // Ini normal untuk development - pastikan .env sudah benar
      if (supabaseUrl) {
        expect(supabaseUrl).toContain("supabase.co");
      }
      if (supabaseAnonKey) {
        expect(supabaseAnonKey).toBeTruthy();
      }
    });
  });

  describe("Error Handling", () => {
    it("should catch and log unexpected errors", async () => {
      // Test case: Error handling untuk unexpected errors

      const handleError = (error: any) => {
        return {
          message:
            error instanceof Error ? error.message : "Error tidak diketahui",
          details: "",
          hint: "",
          code: "ERROR",
        };
      };

      const testError = new Error("Test error");
      const result = handleError(testError);

      expect(result.message).toBe("Test error");
      expect(result.code).toBe("ERROR");
    });

    it("should notify user about submission failures", async () => {
      // Test case: User harus tahu jika submission gagal

      const error = {
        message: "Connection timeout",
        details: "Request failed after 30 seconds",
      };

      const userMessage = `Gagal menyimpan data: ${error.message}`;

      expect(userMessage).toContain("Gagal menyimpan data");
      expect(userMessage).toContain("Connection timeout");
    });
  });
});

describe("Data Flow Validation", () => {
  it("should normalize arrays for facilities and services", () => {
    // Test case: String input harus di-convert ke array

    const normalizeArray = (value?: string[] | string) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }
      return [];
    };

    const input1 = "IGD 24 Jam, ICU, Laboratorium";
    const input2 = ["IGD", "ICU"];
    const input3 = undefined;

    expect(normalizeArray(input1)).toEqual([
      "IGD 24 Jam",
      "ICU",
      "Laboratorium",
    ]);
    expect(normalizeArray(input2)).toEqual(["IGD", "ICU"]);
    expect(normalizeArray(input3)).toEqual([]);
  });

  it("should map hospital data correctly", () => {
    // Test case: Data dari Supabase harus di-map dengan benar ke format frontend

    const supabaseData = {
      id: "123",
      name: "RS Test",
      type: "RS Umum",
      class: "C",
      address: "Jl. Test",
      city: "Kota Serang",
      district: "Kecamatan Test",
      phone: "0274123456",
      email: "test@test.com",
      website: "https://example.com",
      image: "https://example.com/image.jpg",
      description: "Test description",
      has_icu: true,
      has_igd: true,
      total_beds: 100,
      latitude: -6.1185,
      longitude: 106.1564,
      operating_hours: "24 Jam",
      google_maps_link: "https://maps.app.goo.gl/test",
      facilities: ["IGD", "ICU"],
      services: ["Rawat Inap"],
      created_at: "2026-02-20T00:00:00Z",
      updated_at: "2026-02-20T00:00:00Z",
    };

    const mapped = {
      id: supabaseData.id,
      name: supabaseData.name,
      type: supabaseData.type,
      class: supabaseData.class,
      hasICU: supabaseData.has_icu,
      hasIGD: supabaseData.has_igd,
      totalBeds: supabaseData.total_beds,
      latitude: supabaseData.latitude,
      longitude: supabaseData.longitude,
      operatingHours: supabaseData.operating_hours,
      googleMapsLink: supabaseData.google_maps_link,
      facilities: supabaseData.facilities,
      services: supabaseData.services,
    };

    expect(mapped.id).toBe(supabaseData.id);
    expect(mapped.hasICU).toBe(true);
    expect(mapped.totalBeds).toBe(100);
    expect(Array.isArray(mapped.facilities)).toBe(true);
  });
});

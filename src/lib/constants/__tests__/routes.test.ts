import { routes } from "../routes";

describe("Creator Route Constants & Navigation Guard", () => {
  it("should define valid canonical routes for all Kreator menu entry points", () => {
    expect(routes.dashboardKreator).toBe("/dashboard/kreator");
    expect(routes.kreatorJobPool).toBe("/dashboard/kreator/job-pool");
    expect(routes.kreatorActiveWorks).toBe("/dashboard/kreator/pekerjaan-aktif");
    expect(routes.kreatorRateCard).toBe("/dashboard/kreator/rate-card");
    expect(routes.kreatorNegotiation).toBe("/dashboard/kreator/negosiasi");
    expect(routes.kreatorFinance).toBe("/dashboard/kreator/keuangan");
    expect(routes.kreatorWithdrawal).toBe("/dashboard/kreator/keuangan/withdrawal");
    expect(routes.kreatorSettings).toBe("/dashboard/kreator/settings");
  });

  it("should not contain broken /dashboard/kreator/pengaturan path in routes", () => {
    const allRouteValues = [
      routes.home,
      routes.login,
      routes.register,
      routes.dashboardKreator,
      routes.kreatorJobPool,
      routes.kreatorJobPoolDetail("sample-id"),
      routes.kreatorActiveWorks,
      routes.kreatorActiveWorkDetail("sample-id"),
      routes.kreatorRateCard,
      routes.kreatorNegotiation,
      routes.kreatorNegotiationDetail("sample-id"),
      routes.kreatorFinance,
      routes.kreatorWithdrawal,
      routes.kreatorSettings,
      routes.registerWithRole("creator"),
      routes.loginWithNext("/dashboard/kreator"),
    ];
    const hasBrokenPengaturanPath = allRouteValues.some(
      (val) => typeof val === "string" && val.includes("/dashboard/kreator/pengaturan")
    );
    expect(hasBrokenPengaturanPath).toBe(false);
  });
});

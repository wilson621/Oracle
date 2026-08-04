import assert from "node:assert/strict";

export function validateContract(contract) {
  assert.equal(contract.status, "engineering-preparation-qualification-barred");
  const boundary = contract.authorityBoundary;
  for (const key of ["transferCreationPermitted", "authorityCreationPermitted", "qualificationAttemptPermitted", "qualificationExecutionPermitted"]) assert.equal(boundary[key], false, key);
  assert.deepEqual([boundary.maximumTransfers, boundary.maximumAuthorities, boundary.maximumAttempts], [0, 0, 0]);
  assert.equal(contract.host.repositoryPermitted, false);
  assert.equal(contract.host.developmentToolInstallationPermitted, false);
  assert.deepEqual(contract.host.requiredAbsentDevelopmentTools, ["git", "node", "npm", "supabase", "docker"]);
  assert.equal(contract.claimPartition.fixtureEquivalenceClaimed, false);
  assert.equal(contract.claimPartition.fixtureSecurityQualificationClaimed, false);
  assert.equal(contract.cleanHostFixture.loopbackOnly, true);
  assert.equal(contract.cleanHostFixture.productionEndpointsPermitted, false);
  assert.equal(contract.cleanHostFixture.productionCredentialsPermitted, false);
  assert.equal(contract.cleanHostFixture.networkDefaultRoutePermittedDuringQualification, false);
  assert.equal(contract.package.sha256, "492101857733a4cca913243ac660cfb9e181ea796180f1bc9f09c259fe172430");
  assert.deepEqual(contract.qualificationProtocol.requiredRoutes, ["/oracle", "/companion", "/sessions", "/reports", "/intelligence", "/coach", "/progress", "/settings"]);
  assert.deepEqual(contract.qualificationProtocol.companionTransitions, ["attach", "detach", "degradation", "recovery"]);
  assert.equal(contract.historicalTransfers.length, 2);
  assert.ok(contract.historicalTransfers.every(item => item.disposition === "immutable-pre-authority-engineering-failure-prohibited"));
  return contract;
}

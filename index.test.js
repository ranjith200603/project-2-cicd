const test = require('node:test');
const assert = require('node:assert/strict');

test('application returns a successful health status', async () => {
  const response = await fetch('http://localhost:3000/health');
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.status, 'healthy');
});

test('application returns its project information', async () => {
  const response = await fetch('http://localhost:3000/');
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.application, 'Project 2 CI/CD');
});

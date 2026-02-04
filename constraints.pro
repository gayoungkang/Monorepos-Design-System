gen_enforced_dependency(Workspace, DepName, Range) :-
  workspace_has_dependency(Workspace, DepName, _),
  enforce_dependency(Workspace, DepName, Range).

gen_enforced_dependency(Workspace, "@acme/ui", "workspace:*") :-
  workspace_ident(Workspace, Ident),
  string_starts_with(Ident, "apps/").

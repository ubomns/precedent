"""Drafter prompt-construction tests.

These assert the *instructions* sent to the model (no network / LLM call), which is the
deterministic part of the rewording behaviour: terse brief notes must be reworded and
expanded into formal BRD prose, with stakeholders kept verbatim.
"""
from _lib.agents.drafter import build_drafter_system_prompt


def test_reword_directive_present_for_every_section():
    prompt = build_drafter_system_prompt("executive_summary")
    assert "verbatim" in prompt.lower()
    assert "reword" in prompt.lower()
    # Names/roles must be preserved even though everything else is reworded.
    assert "exactly" in prompt.lower()


def test_scope_section_instructs_rewriting_scope_items():
    prompt = build_drafter_system_prompt("scope")
    lower = prompt.lower()
    assert "in-scope" in lower and "out-of-scope" in lower
    assert "scope statement" in lower


def test_stakeholders_section_preserves_names_verbatim():
    prompt = build_drafter_system_prompt("stakeholders")
    lower = prompt.lower()
    assert "exactly" in lower
    assert "raci" in lower


def test_generic_section_has_no_scope_guidance():
    prompt = build_drafter_system_prompt("business_objective")
    # The scope-only example must not leak into other sections.
    assert "scope statement" not in prompt.lower()


def test_prompt_names_the_section():
    assert "functional_requirements" in build_drafter_system_prompt(
        "functional_requirements"
    )
